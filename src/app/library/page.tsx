import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";
import { VideoCard } from "@/components/VideoCard";
import { UpgradeCard } from "@/components/UpgradeCard";
import { createClient } from "@/lib/supabase/server";
import { hasPremiumAccess } from "@/lib/access";
import { CATEGORIES, type Category } from "@/lib/config";
import type { Video } from "@/types/database";

export const metadata = { title: "Videobibliothek" };

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const { profile } = await requireUser();
  const premium = hasPremiumAccess(profile);

  const activeCategory = CATEGORIES.includes(searchParams.category as Category)
    ? (searchParams.category as Category)
    : null;

  const supabase = createClient();
  // Query the safe catalog VIEW – it never returns playback URLs. RLS on the
  // view restricts rows to non-hidden content.
  let query = supabase
    .from("public_video_catalog")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeCategory) query = query.eq("category", activeCategory);

  const { data: catalog } = await query;
  const videos = catalog ?? [];

  return (
    <>
      <AppNav profile={profile} />
      <main className="container-page py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Videobibliothek
            </h1>
            <p className="text-gray-400">
              {premium
                ? "Voller Zugriff auf alle Inhalte."
                : "Free Previews frei · Premium-Inhalte gesperrt."}
            </p>
          </div>
        </div>

        {/* Category filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          <FilterChip label="Alle" href="/library" active={!activeCategory} />
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              href={`/library?category=${encodeURIComponent(cat)}`}
              active={activeCategory === cat}
            />
          ))}
        </div>

        {!premium && (
          <div className="mt-8">
            <UpgradeCard />
          </div>
        )}

        {videos.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => {
              const locked = v.access_level === "premium" && !premium;
              // Cast: the catalog view lacks playback columns, which VideoCard
              // does not use. Safe for display-only rendering.
              return (
                <VideoCard key={v.id} video={v as unknown as Video} locked={locked} />
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`badge px-3 py-1.5 transition ${
        active
          ? "bg-gold-gradient text-base-900"
          : "border border-white/10 bg-white/5 text-gray-300 hover:border-white/25"
      }`}
    >
      {label}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="card mt-8 flex flex-col items-center justify-center gap-3 p-12 text-center">
      <span className="text-4xl">🎬</span>
      <h3 className="text-lg font-semibold text-white">Noch keine Videos hier</h3>
      <p className="max-w-sm text-sm text-gray-400">
        In dieser Kategorie sind aktuell keine Inhalte verfügbar. Schau bald
        wieder vorbei – es kommt regelmäßig Neues dazu.
      </p>
    </div>
  );
}
