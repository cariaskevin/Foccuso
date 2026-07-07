import type { Video } from "@/types/database";
import type { VideoProvider } from "@/lib/config";
import { signRs256 } from "@/lib/jwt";
import { cloudflareUid, getEmbedUrl, muxPlaybackId } from "@/lib/video";

/**
 * SERVER ONLY. Produces the playback source for a video AFTER the caller has
 * verified access (see access.ts + RLS). For the two secure providers
 * (Cloudflare Stream, Mux) it mints a SHORT-LIVED signed token so premium
 * content is never served via a plain, copyable URL. If the signing keys for a
 * provider are not configured, it falls back to the unsigned embed and reports
 * `signed: false` – no silent fake.
 */

export type PlaybackKind = "iframe" | "hls";

export interface PlaybackSource {
  kind: PlaybackKind;
  src: string;
  signed: boolean;
  provider: VideoProvider;
}

// How long a signed playback token stays valid (seconds).
const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

/** Cloudflare Stream: RS256 JWT whose `sub` is the video UID; the token then
 *  replaces the id in the iframe URL. Requires the video to have
 *  `requireSignedURLs: true` set in Cloudflare. */
function signCloudflare(videoUid: string): PlaybackSource | null {
  const kid = process.env.CLOUDFLARE_STREAM_KEY_ID;
  const pem = process.env.CLOUDFLARE_STREAM_PRIVATE_KEY;
  if (!kid || !pem) return null;

  const iat = nowSeconds();
  const token = signRs256(
    { alg: "RS256", kid },
    { sub: videoUid, kid, exp: iat + TOKEN_TTL_SECONDS, nbf: iat - 60 },
    pem
  );

  const subdomain = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;
  const src = subdomain
    ? `https://${subdomain}/${token}/iframe`
    : `https://iframe.videodelivery.net/${token}`;

  return { kind: "iframe", src, signed: true, provider: "cloudflare" };
}

/** Mux: RS256 JWT with `sub` = playback id and `aud: "v"` (video), appended as
 *  `?token=` to the HLS stream URL. Requires a SIGNED playback id in Mux. */
function signMux(playbackId: string): PlaybackSource | null {
  const kid = process.env.MUX_SIGNING_KEY_ID;
  const pem = process.env.MUX_SIGNING_PRIVATE_KEY;
  if (!kid || !pem) return null;

  const iat = nowSeconds();
  const token = signRs256(
    { alg: "RS256", typ: "JWT", kid },
    { sub: playbackId, aud: "v", exp: iat + TOKEN_TTL_SECONDS, kid },
    pem
  );

  return {
    kind: "hls",
    src: `https://stream.mux.com/${playbackId}.m3u8?token=${token}`,
    signed: true,
    provider: "mux",
  };
}

export function getSignedPlayback(video: Video): PlaybackSource {
  const { video_provider, video_url_or_id } = video;

  if (video_provider === "cloudflare") {
    const signed = signCloudflare(cloudflareUid(video_url_or_id));
    if (signed) return signed;
    return {
      kind: "iframe",
      src: getEmbedUrl("cloudflare", video_url_or_id),
      signed: false,
      provider: "cloudflare",
    };
  }

  if (video_provider === "mux") {
    const id = muxPlaybackId(video_url_or_id);
    const signed = signMux(id);
    if (signed) return signed;
    return {
      kind: "hls",
      src: `https://stream.mux.com/${id}.m3u8`,
      signed: false,
      provider: "mux",
    };
  }

  // Vimeo / YouTube: not the secure premium providers – unsigned embed.
  return {
    kind: "iframe",
    src: getEmbedUrl(video_provider, video_url_or_id),
    signed: false,
    provider: video_provider,
  };
}
