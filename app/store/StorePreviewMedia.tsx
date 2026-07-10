"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { isHlsMediaUrl, isIframeMediaUrl } from "@/lib/store-media-url";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  /** When false, playback errors are hidden from visitors (admin-only). */
  showErrors?: boolean;
};

export function StorePreviewMedia({ src, poster, className, showErrors = false }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || isIframeMediaUrl(src)) return;

    setError(null);
    const isHls = isHlsMediaUrl(src);
    let hls: Hls | null = null;

    const onVideoError = () => {
      if (!showErrors) return;
      setError("Could not load this preview URL. Check that the link is public and supports browser playback.");
    };

    video.addEventListener("error", onVideoError);

    if (isHls && Hls.isSupported()) {
      hls = new Hls();
      hls.on(Hls.Events.ERROR, () => onVideoError());
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
      video.load();
    }

    return () => {
      video.removeEventListener("error", onVideoError);
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, showErrors]);

  if (!src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-black/40 text-sm text-neutral-500 ${className ?? ""}`}
      >
        {showErrors ? "No preview URL set." : "Preview unavailable."}
      </div>
    );
  }

  if (isIframeMediaUrl(src)) {
    const embedSrc = src.includes("/embed/")
      ? src
      : src.replace("iframe.mediadelivery.net/play/", "iframe.mediadelivery.net/embed/");

    return (
      <div className={`relative h-full w-full ${className ?? ""}`}>
        <iframe
          src={embedSrc}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      <video
        ref={videoRef}
        key={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
      />
      {showErrors && error ? (
        <p className="absolute inset-x-0 bottom-0 bg-black/80 px-3 py-2 text-center text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
