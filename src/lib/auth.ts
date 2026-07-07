import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

/**
 * Returns the authenticated user + profile for the current request, or null.
 * Uses getUser() which validates the token with Supabase (not just the cookie).
 */
export async function getSessionProfile(): Promise<{
  userId: string;
  profile: Profile | null;
} | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { userId: user.id, profile: profile ?? null };
}

/** Require a signed-in user in a server component/route; redirect otherwise. */
export async function requireUser() {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  return session;
}

/** Require an admin; redirect non-admins to the dashboard. */
export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile?.role !== "admin") redirect("/dashboard");
  return session;
}
