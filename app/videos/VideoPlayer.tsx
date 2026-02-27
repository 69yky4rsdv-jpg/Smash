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
    <video
      ref={videoRef}
      // For non-HLS sources (e.g. MP4), let the browser handle src directly
      src={src.endsWith(".m3u8") ? undefined : src}
      poster={poster}
      controls
      playsInline
      className={className}
    />
  );
}

