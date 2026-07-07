"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

/**
 * Plays an HLS (.m3u8) stream, used for Mux signed playback. The `src` is a
 * short-lived, tokenized URL produced server-side – it is safe to hand to the
 * browser because it expires and is scoped to a single playback id.
 */
export function HlsPlayer({ src, title }: { src: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Safari / iOS play HLS natively.
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      className="h-full w-full bg-black"
      title={title}
    />
  );
}
