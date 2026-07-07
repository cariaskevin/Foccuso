import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";
import { UpgradeCard } from "@/components/UpgradeCard";
import { createClient } from "@/lib/supabase/server";
import { hasPremiumAccess, isAdmin } from "@/lib/access";
import { getSignedPlayback } from "@/lib/playback";
import { getCatalogVideo } from "@/lib/catalog";
import { HlsPlayer } from "@/components/HlsPlayer";

export const metadata = { title: "Video" };

export default async function WatchPage({
  params,
}: {
  params: { id: string };
}) {
  const { profile } = await requireUser();
  const premium = hasPremiumAccess(profile);
  const admin = isAdmin(profile);

  const supabase = createClient();
  // Fetch from the real table. RLS returns the row (incl. playback URL) ONLY if
  // the user is allowed to watch it. Hidden/premium rows are withheld from the
  // database itself for unauthorized users – not just hidden in the UI.
  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  // If RLS withheld the row, look it up via the safe catalog (no playback URL)
  // to tell "premium lock" apart from "does not exist".
  const teaser = video ? null : await getCatalogVideo(params.id);

  if (!video && !teaser) notFound();

  // Locked: exists as a non-hidden teaser but the protected row was withheld.
  if (!video && teaser) {
    return (
      <Shell profile={profile}>
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
      </Shell>
    );
  }

  if (!video) notFound();

  // Defense in depth: even though RLS returned the row, re-check access here.
  if (video.access_level === "premium" && !premium) {
    return (
      <Shell profile={profile}>
        <div className="mt-6">
          <UpgradeCard />
        </div>
      </Shell>
    );
  }

  const playback = getSignedPlayback(video);

  // Production safety: a premium video that could not be signed is NEVER served
  // as an unsigned embed. Users see a neutral message; admins see how to fix it.
  if (!playback.ok) {
    return (
      <Shell profile={profile}>
        <div className="card mt-6 overflow-hidden">
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-base-700 p-6 text-center">
            <span className="text-4xl">🔒</span>
            {admin ? (
              <>
                <h2 className="text-lg font-semibold text-white">
                  Signierte Wiedergabe nicht konfiguriert
                </h2>
                <p className="max-w-md text-sm text-gray-400">
                  Dieses Premium-Video ({playback.provider}) kann in Produktion
                  nicht unsigniert ausgeliefert werden. Hinterlege die
                  Signing-Keys{" "}
                  <code className="text-gold-soft">
                    {playback.provider === "mux"
                      ? "MUX_SIGNING_KEY_ID / MUX_SIGNING_PRIVATE_KEY"
                      : playback.provider === "cloudflare"
                      ? "CLOUDFLARE_STREAM_KEY_ID / CLOUDFLARE_STREAM_PRIVATE_KEY"
                      : "eines signierbaren Providers (Cloudflare Stream oder Mux)"}
                  </code>{" "}
                  und aktiviere signierte Wiedergabe beim Provider.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-white">
                  Video vorübergehend nicht verfügbar
                </h2>
                <p className="max-w-sm text-sm text-gray-400">
                  Dieser Inhalt kann gerade nicht abgespielt werden. Bitte
                  versuche es später erneut.
                </p>
              </>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell profile={profile}>
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
    </Shell>
  );
}

function Shell({
  profile,
  children,
}: {
  profile: Parameters<typeof AppNav>[0]["profile"];
  children: React.ReactNode;
}) {
  return (
    <>
      <AppNav profile={profile} />
      <main className="container-page py-10">
        <Link href="/library" className="text-sm text-gold-soft hover:underline">
          ← Zurück zur Bibliothek
        </Link>
        {children}
      </main>
    </>
  );
}
