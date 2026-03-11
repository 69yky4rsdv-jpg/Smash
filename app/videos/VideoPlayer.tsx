"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

type Props = {
  src: string;
  poster?: string;
  className?: string;
};

export function VideoPlayer({ src, poster, className }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Use hls.js for .m3u8 streams in browsers that don't support HLS natively
    if (Hls.isSupported() && src.endsWith(".m3u8")) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl") && src.endsWith(".m3u8")) {
      // Safari / iOS can handle HLS natively with <video src="...m3u8">
      video.src = src;
    }

    return undefined;
  }, [src]);

  return (
    <div className={`relative ${className ?? ""}`} style={{ maxWidth: "100%", maxHeight: "100%" }}>
      <video
        ref={videoRef}
        // For non-HLS sources (e.g. MP4), let the browser handle src directly
        src={src.endsWith(".m3u8") ? undefined : src}
        poster={poster}
        controls
        playsInline
        className="h-full w-full object-contain"
      />
      <div className="pointer-events-none absolute left-2 -bottom-10 z-10">
        <img
          src="https://Pull-Video-Load.b-cdn.net/logo/BIg-SMASHPOV.COM-2.png"
          alt="SmashPov watermark"
          className="h-40 opacity-80 drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]"
        />
      </div>
    </div>
  );
}

