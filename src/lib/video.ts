import type { VideoProvider } from "@/lib/config";

/**
 * Pure helpers for turning a stored provider id/url into an UNSIGNED embed URL,
 * plus extracting the bare provider id. No secrets here – safe anywhere.
 * Signed premium playback lives in `src/lib/playback.ts` (server only).
 */
export function getEmbedUrl(provider: VideoProvider, idOrUrl: string): string {
  switch (provider) {
    case "cloudflare":
      if (idOrUrl.startsWith("http")) return idOrUrl;
      return `https://iframe.videodelivery.net/${idOrUrl}`;
    case "mux":
      if (idOrUrl.startsWith("http")) return idOrUrl;
      return `https://stream.mux.com/${idOrUrl}.m3u8`;
    case "vimeo":
      if (idOrUrl.startsWith("http")) {
        const match = idOrUrl.match(/vimeo\.com\/(\d+)/);
        return match ? `https://player.vimeo.com/video/${match[1]}` : idOrUrl;
      }
      return `https://player.vimeo.com/video/${idOrUrl}`;
    case "youtube":
      if (idOrUrl.includes("watch?v=")) {
        const id = new URL(idOrUrl).searchParams.get("v");
        return `https://www.youtube.com/embed/${id}`;
      }
      if (idOrUrl.startsWith("http")) return idOrUrl;
      return `https://www.youtube.com/embed/${idOrUrl}`;
    default:
      return idOrUrl;
  }
}

/** Extract a bare Cloudflare Stream video UID from an id or full URL. */
export function cloudflareUid(idOrUrl: string): string {
  if (!idOrUrl.startsWith("http")) return idOrUrl;
  try {
    const parts = new URL(idOrUrl).pathname.split("/").filter(Boolean);
    return parts[0] || idOrUrl;
  } catch {
    return idOrUrl;
  }
}

/** Extract a bare Mux playback id from an id or full stream URL. */
export function muxPlaybackId(idOrUrl: string): string {
  const strip = (s: string) => s.replace(/\.m3u8.*$/, "");
  if (!idOrUrl.startsWith("http")) return strip(idOrUrl);
  try {
    const last = new URL(idOrUrl).pathname.split("/").filter(Boolean).pop();
    return last ? strip(last) : idOrUrl;
  } catch {
    return idOrUrl;
  }
}
