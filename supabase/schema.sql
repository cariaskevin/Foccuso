-- ==========================================================================
-- Velqor Society – Supabase schema, functions, triggers, RLS & policies
-- Run this ENTIRE file in the Supabase SQL Editor (or via the CLI) once.
-- It is idempotent-ish: safe to re-run in a fresh project.
-- ==========================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

-- profiles: 1:1 with auth.users. Holds role + Stripe/subscription truth.
create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text,
  full_name           text,
  role                text not null default 'free_user'
                        check (role in ('free_user', 'premium_member', 'admin')),
  stripe_customer_id  text unique,
  subscription_status text,
  current_period_end  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- videos: content catalog. The playback columns (video_url_or_id, provider)
-- are sensitive and protected by RLS below.
create table if not exists public.videos (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  category        text not null
                    check (category in ('Business','Sales','AI','Crypto','Mindset','Social Media')),
  thumbnail_url   text,
  video_provider  text not null
                    check (video_provider in ('cloudflare','mux','vimeo','youtube')),
  video_url_or_id text not null,
  access_level    text not null default 'free'
                    check (access_level in ('free','premium','hidden')),
  created_at      timestamptz not null default now()
);

create index if not exists videos_category_idx on public.videos (category);
create index if not exists videos_access_level_idx on public.videos (access_level);

-- ----------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER, owned by postgres -> bypass RLS,
-- so they can be safely called from within RLS policies without recursion).
-- ----------------------------------------------------------------------------

-- True if the given user is an admin.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

-- True if the given user currently has premium access.
-- Truth = admin OR (active/trialing subscription that has not yet expired).
create or replace function public.has_premium(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid
      and (
        p.role = 'admin'
        or (
          p.subscription_status in ('active','trialing')
          and p.current_period_end is not null
          and p.current_period_end > now()
        )
      )
  );
$$;

-- ----------------------------------------------------------------------------
-- Trigger: create a profile row automatically for every new auth user.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Trigger: PROTECT privileged profile columns.
-- Normal users may update their own profile row, but NEVER the role, Stripe or
-- subscription fields. Only the service role (webhook / server) may change them.
-- This is the hard database-level guarantee behind security rules 3 & 4.
-- ----------------------------------------------------------------------------
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- The service role (used only server-side by the Stripe webhook/checkout)
  -- is allowed to write privileged columns.
  if auth.role() = 'service_role' then
    new.updated_at = now();
    return new;
  end if;

  -- Everyone else: reject any change to protected columns.
  if new.role              is distinct from old.role
     or new.stripe_customer_id  is distinct from old.stripe_customer_id
     or new.subscription_status is distinct from old.subscription_status
     or new.current_period_end  is distinct from old.current_period_end then
    raise exception
      'Not allowed to modify protected profile columns (role/stripe/subscription).';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists protect_profile_columns_trg on public.profiles;
create trigger protect_profile_columns_trg
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ----------------------------------------------------------------------------
-- Safe catalog VIEW: lets members see premium *teasers* (title, thumbnail,
-- category) WITHOUT ever exposing the playback URL/provider. Runs with the
-- view owner's rights (security_invoker = false) and only selects non-sensitive
-- columns for non-hidden videos. This is a deliberate, minimal exposure.
-- ----------------------------------------------------------------------------
create or replace view public.public_video_catalog
with (security_invoker = false)
as
  select id, title, description, category, thumbnail_url, access_level, created_at
  from public.videos
  where access_level <> 'hidden';

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.videos   enable row level security;

-- ---- profiles policies ----
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using ( id = auth.uid() or public.is_admin(auth.uid()) );

-- Users may update ONLY their own row; the protect trigger blocks privileged
-- columns. Admins may update any row (still bound by the same trigger unless
-- acting via the service role).
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using ( id = auth.uid() or public.is_admin(auth.uid()) )
  with check ( id = auth.uid() or public.is_admin(auth.uid()) );

-- No INSERT/DELETE policy for regular users: profile creation is handled by the
-- handle_new_user trigger (service context) and deletion cascades from auth.users.

-- ---- videos policies ----
-- SELECT: free videos to any signed-in user; premium only to premium members;
-- hidden only to admins; admins see everything.
drop policy if exists "videos_select_by_access" on public.videos;
create policy "videos_select_by_access"
  on public.videos for select
  using (
    (access_level = 'free'    and auth.uid() is not null)
    or (access_level = 'premium' and public.has_premium(auth.uid()))
    or public.is_admin(auth.uid())
  );

-- Only admins may create / edit / delete videos.
drop policy if exists "videos_insert_admin" on public.videos;
create policy "videos_insert_admin"
  on public.videos for insert
  with check ( public.is_admin(auth.uid()) );

drop policy if exists "videos_update_admin" on public.videos;
create policy "videos_update_admin"
  on public.videos for update
  using ( public.is_admin(auth.uid()) )
  with check ( public.is_admin(auth.uid()) );

drop policy if exists "videos_delete_admin" on public.videos;
create policy "videos_delete_admin"
  on public.videos for delete
  using ( public.is_admin(auth.uid()) );

-- ----------------------------------------------------------------------------
-- Grants
-- ----------------------------------------------------------------------------
-- Tables: authenticated users interact through RLS. anon has no access.
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.videos to authenticated;

-- Catalog view: readable by signed-in members only (never anon).
revoke all on public.public_video_catalog from anon;
grant select on public.public_video_catalog to authenticated;

-- ----------------------------------------------------------------------------
-- Promote yourself to admin (run ONCE, replace the email):
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
-- ----------------------------------------------------------------------------
