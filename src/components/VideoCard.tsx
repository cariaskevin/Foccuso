import Link from "next/link";
import type { Video } from "@/types/database";

/**
 * A single video tile. `locked` is decided server-side by the caller based on
 * hasPremiumAccess – this component only renders the state it is given.
 */
export function VideoCard({ video, locked }: { video: Video; locked: boolean }) {
  const inner = (
    <div className="card group overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden bg-base-700">
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-600">
            <span className="text-4xl">▶</span>
          </div>
        )}
        <span className="absolute left-2 top-2 badge border border-white/10 bg-black/60 text-gray-200">
          {video.category}
        </span>
        {video.access_level === "premium" && (
          <span className="absolute right-2 top-2 badge border border-gold/30 bg-black/60 text-gold-soft">
            Premium
          </span>
        )}
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 backdrop-blur-sm">
            <span className="text-2xl">🔒</span>
            <span className="text-xs font-medium text-gray-200">
              Premium erforderlich
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold text-white">{video.title}</h3>
        {video.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-400">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );

  if (locked) {
    // Locked cards link to the account page to upgrade instead of the player.
    return <Link href="/account">{inner}</Link>;
  }
  return <Link href={`/library/${video.id}`}>{inner}</Link>;
}
