"use client";

import type { Video } from "@/lib/types";
import type { VideoEngagement } from "@/lib/video-engagement";
import Link from "next/link";
import { useRef, useCallback, useEffect, useState } from "react";
import Hls from "hls.js";
import { ScrollingTitle } from "../(site)/ScrollingTitle";

type Props = {
  video: Video;
  engagement?: VideoEngagement;
  titleClassName?: string;
  dateClassName?: string;
  thumbClassName?: string;
  /** When true, marquee runs only on card hover (homepage / list). */
  titleAnimateOnHover?: boolean;
};

/** Skip only iframe/embed. HLS (.m3u8) and direct MP4/etc are both previewable. */
function isPreviewableVideoUrl(url: string): boolean {
  if (!url || url.includes("iframe") || url.includes("embed")) return false;
  return (
    /\.m3u8(\?|$)/i.test(url) ||
    /\.(mp4|webm|mov)(\?|$)/i.test(url) ||
    url.startsWith("/") ||
    url.includes("/videos/")
  );
}

function isHlsUrl(url: string): boolean {
  return /\.m3u8(\?|$)/i.test(url);
}

const PREVIEW_DURATION_SEC = 30;

export function VideoCardWithPreview({
  video,
  engagement,
  titleClassName = "mt-2 text-sm font-medium text-neutral-100 line-clamp-2 group-hover:text-accent-pinkSoft transition-colors duration-200",
  dateClassName = "mt-0.5 text-xs text-neutral-500",
  thumbClassName = "aspect-video w-full overflow-hidden rounded-lg bg-neutral-900",
  titleAnimateOnHover = true
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoveringRef = useRef(false);
  const hlsRef = useRef<Hls | null>(null);
  const timeupdateHandlerRef = useRef<(() => void) | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const showVideoPreview = isPreviewableVideoUrl(video.videoUrl);
  const useHls = showVideoPreview && isHlsUrl(video.videoUrl);

  const clearTimeupdate = useCallback(() => {
    const el = videoRef.current;
    const handler = timeupdateHandlerRef.current;
    if (el && handler) {
      el.removeEventListener("timeupdate", handler);
      timeupdateHandlerRef.current = null;
    }
  }, []);

  const onVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  const onEnter = useCallback(() => {
    hoveringRef.current = true;
    setIsHovering(true);
    const el = videoRef.current;
    if (!el || !showVideoPreview) return;

    if (useHls) {
      if (Hls.isSupported()) {
        if (hlsRef.current) return;
        const hls = new Hls({
          startLevel: -1,
          maxBufferLength: 8,
          maxMaxBufferLength: 20,
          maxBufferSize: 10 * 1000 * 1000,
        });
        hlsRef.current = hls;
        hls.loadSource(video.videoUrl);
        hls.attachMedia(el);
        el.addEventListener("canplay", () => setVideoReady(true), { once: true });
        hls.on(Hls.Events.ERROR, () => {});
      } else if (el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = video.videoUrl;
        el.addEventListener("canplay", () => setVideoReady(true), { once: true });
      }
    } else {
      el.addEventListener("canplay", () => setVideoReady(true), { once: true });
    }
  }, [showVideoPreview, useHls, video.videoUrl]);

  const onLeave = useCallback(() => {
    hoveringRef.current = false;
    setIsHovering(false);
    setVideoReady(false);
    setIsPlaying(false);
    clearTimeupdate();
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
      if (useHls && !Hls.isSupported() && el.canPlayType("application/vnd.apple.mpegurl")) {
        el.removeAttribute("src");
      }
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, [useHls, clearTimeupdate]);

  const onPreviewClick = useCallback(
    (e: React.MouseEvent) => {
      if (!showVideoPreview) return;
      e.preventDefault();
      e.stopPropagation();
      const el = videoRef.current;
      if (!el || !videoReady) return;
      clearTimeupdate();
      const d = el.duration;
      let start = 0;
      if (Number.isFinite(d) && d > 0) {
        start = Math.max(0, d / 2 - PREVIEW_DURATION_SEC / 2);
        el.currentTime = start;
      }
      el.play().then(() => setIsPlaying(true)).catch(() => {});
      const stopAfter = () => {
        if (!el) return;
        if (el.currentTime - start >= PREVIEW_DURATION_SEC) {
          el.pause();
          setIsPlaying(false);
          clearTimeupdate();
        }
      };
      timeupdateHandlerRef.current = stopAfter;
      el.addEventListener("timeupdate", stopAfter);
    },
    [showVideoPreview, videoReady, clearTimeupdate]
  );

  useEffect(() => {
    return () => {
      clearTimeupdate();
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [clearTimeupdate]);

  // Auto-play preview as soon as it's ready on hover (instant, no delay)
  useEffect(() => {
    if (!videoReady || !isHovering || isPlaying) return;
    const el = videoRef.current;
    if (!el || !showVideoPreview) return;
    clearTimeupdate();
    const d = el.duration;
    let start = 0;
    if (Number.isFinite(d) && d > 0) {
      start = Math.max(0, d / 2 - PREVIEW_DURATION_SEC / 2);
      el.currentTime = start;
    }
    el.play().then(() => setIsPlaying(true)).catch(() => {});
    const stopAfter = () => {
      if (!el) return;
      if (el.currentTime - start >= PREVIEW_DURATION_SEC) {
        el.pause();
        setIsPlaying(false);
        clearTimeupdate();
      }
    };
    timeupdateHandlerRef.current = stopAfter;
    el.addEventListener("timeupdate", stopAfter);
    return () => {
      el.removeEventListener("timeupdate", stopAfter);
      timeupdateHandlerRef.current = null;
    };
  }, [videoReady, isHovering, showVideoPreview, clearTimeupdate]);

  const showPlayOverlay = showVideoPreview && !isPlaying && videoReady;

  const playIcon = (
    <span
      className={`pointer-events-none absolute inset-0 z-[11] flex items-center justify-center transition-opacity duration-200 ${showVideoPreview && videoReady && !isPlaying ? "opacity-100" : "opacity-0"}`}
      aria-hidden
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 shadow-lg ring-2 ring-pink-300/50 backdrop-blur-sm sm:h-16 sm:w-16">
        <svg className="ml-1 h-6 w-6 text-pink-200 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      </span>
    </span>
  );

  return (
    <Link
      href={`/videos/${video.id}`}
      className="group block min-w-0"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className={`relative min-w-0 overflow-hidden ${thumbClassName}`}>
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className={`h-full w-full object-cover transition-all duration-200 ${showVideoPreview && (isPlaying || videoReady) ? "group-hover:opacity-0 group-hover:scale-[1.02]" : "group-hover:scale-[1.02]"}`}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-tr from-pink-500/30 via-black to-pink-700/40" />
        )}
        {playIcon}
        {engagement && engagement.views > 0 && (
          <span className="absolute right-2 top-2 z-[12] inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-pink-200 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {engagement.likePercent}%
          </span>
        )}
        {showVideoPreview && (
          <>
            <video
              ref={videoRef}
              src={useHls ? undefined : video.videoUrl}
              muted
              playsInline
              loop={false}
              preload={useHls ? "none" : "auto"}
              onCanPlay={onVideoReady}
              onLoadedData={onVideoReady}
              className={`absolute inset-0 z-10 h-full w-full object-cover ${isPlaying || (isHovering && showVideoPreview) ? "opacity-100" : "opacity-0"}`}
            />
            <button
              type="button"
              onClick={onPreviewClick}
              className={`absolute inset-0 z-20 cursor-pointer bg-transparent focus:outline-none ${!showPlayOverlay ? "pointer-events-none" : ""}`}
              aria-label="Play preview"
            />
          </>
        )}
      </div>
      <h3 className={titleClassName}>
        <ScrollingTitle
          title={video.title}
          animateOnHover={titleAnimateOnHover}
        />
      </h3>
      <p className={dateClassName}>
        {new Date(video.publishedAt).toLocaleDateString()}
      </p>
    </Link>
  );
}
