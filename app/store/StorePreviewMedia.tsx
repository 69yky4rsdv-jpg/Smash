"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { isHlsMediaUrl, isIframeMediaUrl } from "@/lib/store-media-url";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  showErrors?: boolean;
  /** Stop playback after this many seconds (store preview clip). */
  maxDurationSeconds?: number;
};

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function StorePreviewMedia({
  src,
  poster,
  className,
  showErrors = false,
  maxDurationSeconds,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timedPreview = Boolean(maxDurationSeconds && maxDurationSeconds > 0);

  useEffect(() => {
    setPreviewEnded(false);
    setElapsed(0);
    setIsPlaying(false);
  }, [src, maxDurationSeconds]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || isIframeMediaUrl(src)) return;

    setError(null);
    const isHls = isHlsMediaUrl(src);
    let hls: Hls | null = null;
    const limit = maxDurationSeconds ?? 0;

    const clampTime = () => {
      if (!limit) return;
      if (video.currentTime > limit) {
        video.currentTime = limit;
      }
      if (video.currentTime >= limit) {
        video.pause();
        video.currentTime = limit;
        setPreviewEnded(true);
        setIsPlaying(false);
      }
    };

    const onVideoError = () => {
      if (!showErrors) return;
      setError("Could not load this preview URL. Check that the link is public and supports browser playback.");
    };

    const onTimeUpdate = () => {
      setElapsed(Math.min(video.currentTime, limit || video.currentTime));
      if (limit) clampTime();
    };

    const onSeeking = () => {
      if (!limit) return;
      if (video.currentTime > limit) video.currentTime = limit;
      if (video.currentTime < 0) video.currentTime = 0;
    };

    const onPlay = () => {
      if (limit && video.currentTime >= limit - 0.05) {
        video.pause();
        setPreviewEnded(true);
        setIsPlaying(false);
        return;
      }
      setIsPlaying(true);
    };

    const onPause = () => setIsPlaying(false);

    video.addEventListener("error", onVideoError);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("seeking", onSeeking);
    video.addEventListener("seeked", onSeeking);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

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
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("seeked", onSeeking);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, showErrors, maxDurationSeconds]);

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

  const limit = maxDurationSeconds ?? 0;
  const progress = limit > 0 ? Math.min(100, (elapsed / limit) * 100) : 0;

  function togglePlay() {
    const video = videoRef.current;
    if (!video || previewEnded) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }

  function restartPreview() {
    const video = videoRef.current;
    if (!video || !limit) return;
    setPreviewEnded(false);
    video.currentTime = 0;
    void video.play();
  }

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      <video
        ref={videoRef}
        key={src}
        poster={poster}
        controls={!timedPreview}
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
        onContextMenu={timedPreview ? (e) => e.preventDefault() : undefined}
      />
      {timedPreview ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-pink-200">
              Free preview · {formatClock(limit)}
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-pink-400 transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {!previewEnded ? (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-medium text-white hover:bg-black/90"
            >
              {isPlaying ? "Pause" : "Play preview"}
            </button>
          ) : null}
        </>
      ) : null}
      {previewEnded ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 p-4 text-center">
          <p className="text-sm font-medium text-white">Preview ended</p>
          <p className="max-w-xs text-xs text-neutral-300">Purchase to watch the full video.</p>
          <button
            type="button"
            onClick={restartPreview}
            className="rounded-full border border-white/20 px-4 py-2 text-xs text-neutral-200 hover:bg-white/10"
          >
            Replay preview
          </button>
        </div>
      ) : null}
      {showErrors && error ? (
        <p className="absolute inset-x-0 bottom-0 bg-black/80 px-3 py-2 text-center text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
