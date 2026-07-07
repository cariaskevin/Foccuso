import type { Video } from "@/types/database";
import type { VideoProvider } from "@/lib/config";

/**
 * Builds the iframe embed URL for a given provider + id/url.
 *
 * SECURITY NOTE (see SECURITY_CHECKLIST.md, item "Signed Playback"):
 * For a production launch, premium video access must NOT rely on a plain,
 * copyable embed URL. Cloudflare Stream and Mux both support SIGNED playback:
 *  - Cloudflare Stream: generate a short-lived signed token server-side and
 *    embed `.../<token>/iframe`. Requires STREAM signing keys.
 *  - Mux: create a signed playback ID + a short-lived JWT server-side.
 *    Requires MUX_SIGNING_KEY / MUX_PRIVATE_KEY.
 * The `getSignedPlayback()` stub below is the single seam to implement this.
 * Until real signing keys are provided it returns the unsigned embed, so the
 * feature is *prepared* but not silently faked.
 */
export function getEmbedUrl(provider: VideoProvider, idOrUrl: string): string {
  switch (provider) {
    case "cloudflare":
      // Accept a raw video UID or a full customer subdomain URL.
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

export interface PlaybackSource {
  embedUrl: string;
  signed: boolean;
}

/**
 * Returns a playback source for a video. This runs SERVER-SIDE only and MUST be
 * called after the caller has verified the viewer's access (see access.ts).
 *
 * When signing keys are configured, replace the body to mint a short-lived
 * signed token. Right now it returns the unsigned embed and reports signed:false
 * so the UI / logs make the security posture explicit.
 */
export function getSignedPlayback(video: Video): PlaybackSource {
  // TODO(signed-playback): when CLOUDFLARE_STREAM_* / MUX_SIGNING_* are set,
  // generate a signed token here and return { embedUrl, signed: true }.
  return {
    embedUrl: getEmbedUrl(video.video_provider, video.video_url_or_id),
    signed: false,
  };
}
