import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";
import { UpgradeCard } from "@/components/UpgradeCard";
import { createClient } from "@/lib/supabase/server";
import { hasPremiumAccess } from "@/lib/access";
import { getSignedPlayback } from "@/lib/playback";
import { HlsPlayer } from "@/components/HlsPlayer";

export const metadata = { title: "Video" };

export default async function WatchPage({
  params,
}: {
  params: { id: string };
}) {
  const { profile } = await requireUser();
  const premium = hasPremiumAccess(profile);

  const supabase = createClient();
  // Fetch from the real table. RLS returns the row (incl. playback URL) ONLY if
  // the user is allowed to watch it. Hidden/premium rows are withheld from the
  // database itself for unauthorized users – not just hidden in the UI.
  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  // Row exists in catalog but RLS withheld it -> it's a premium lock.
  const { data: teaser } = await supabase
    .from("public_video_catalog")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!video && !teaser) notFound();

  // Locked: catalog shows it but the protected row was withheld by RLS.
  if (!video && teaser) {
    return (
      <>
        <AppNav profile={profile} />
        <main className="container-page py-10">
          <BackLink />
          <div className="card mt-6 overflow-hidden">
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-base-700 text-center">
              <span className="text-4xl">🔒</span>
              <h2 className="text-lg font-semibold text-white">
                Dieser Inhalt ist Premium
              </h2>
              <p className="max-w-sm text-sm text-gray-400">
                Schalte Velqor Society Premium frei, um „{teaser.title}“ und alle
                weiteren Inhalte anzusehen.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <UpgradeCard />
          </div>
        </main>
      </>
    );
  }

  if (!video) notFound();

  // Defense in depth: even though RLS returned the row, re-check access here.
  if (video.access_level === "premium" && !premium) {
    return (
      <>
        <AppNav profile={profile} />
        <main className="container-page py-10">
          <BackLink />
          <div className="mt-6">
            <UpgradeCard />
          </div>
        </main>
      </>
    );
  }

  const playback = getSignedPlayback(video);

  return (
    <>
      <AppNav profile={profile} />
      <main className="container-page py-10">
        <BackLink />
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-card">
          <div className="aspect-video w-full">
            {playback.kind === "hls" ? (
              <HlsPlayer src={playback.src} title={video.title} />
            ) : (
              <iframe
                src={playback.src}
                title={video.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <span className="badge border border-white/10 bg-white/5 text-gray-300">
              {video.category}
            </span>
            {video.access_level === "premium" && (
              <span className="badge border border-gold/30 bg-gold/10 text-gold-soft">
                Premium
              </span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white">{video.title}</h1>
          {video.description && (
            <p className="mt-2 whitespace-pre-line text-gray-400">
              {video.description}
            </p>
          )}
        </div>
      </main>
    </>
  );
}

function BackLink() {
  return (
    <Link href="/library" className="text-sm text-gold-soft hover:underline">
      ← Zurück zur Bibliothek
    </Link>
  );
}
