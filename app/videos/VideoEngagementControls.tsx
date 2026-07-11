"use client";

import { useEffect, useState, useTransition } from "react";
import type { VideoEngagement } from "@/lib/video-engagement";
import { recordVideoViewAction, toggleVideoLikeAction } from "./actions";

type Props = {
  videoId: string;
  initialLiked: boolean;
  initialEngagement: VideoEngagement;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      className="h-4 w-4"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  );
}

function getStoredIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function setStoredIds(key: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function VideoEngagementControls({ videoId, initialLiked, initialEngagement }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [engagement, setEngagement] = useState(initialEngagement);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLiked(initialLiked);
    setEngagement(initialEngagement);
  }, [initialLiked, initialEngagement, videoId]);

  useEffect(() => {
    const savedIds = getStoredIds("vs-saved-videos");
    setSaved(savedIds.includes(videoId));
  }, [videoId]);

  useEffect(() => {
    const viewedKey = `vs-view-recorded-${videoId}`;
    if (typeof window === "undefined" || sessionStorage.getItem(viewedKey)) return;

    recordVideoViewAction(videoId).then((next) => {
      sessionStorage.setItem(viewedKey, "1");
      setEngagement(next);
    });
  }, [videoId]);

  function toggleSaved() {
    const ids = getStoredIds("vs-saved-videos");
    const index = ids.indexOf(videoId);
    if (index === -1) {
      ids.push(videoId);
      setSaved(true);
    } else {
      ids.splice(index, 1);
      setSaved(false);
    }
    setStoredIds("vs-saved-videos", ids);
  }

  function toggleLike() {
    startTransition(async () => {
      try {
        const result = await toggleVideoLikeAction(videoId);
        setLiked(result.liked);
        setEngagement(result.engagement);
      } catch {
        // User not signed in — ignore
      }
    });
  }

  const percentLabel =
    engagement.views > 0 ? `${engagement.likePercent}% liked` : "Be the first to like";

  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-300">
      <button
        type="button"
        onClick={toggleLike}
        disabled={isPending}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 transition disabled:opacity-60 ${
          liked
            ? "border-pink-400 bg-pink-400/25 text-pink-200"
            : "border-white/15 bg-white/5 hover:bg-white/10"
        }`}
        aria-pressed={liked}
      >
        <HeartIcon filled={liked} />
        <span>{liked ? "Liked" : "Like"}</span>
        <span className="text-neutral-400">·</span>
        <span className="font-semibold text-neutral-100">{percentLabel}</span>
      </button>
      <button
        type="button"
        onClick={toggleSaved}
        className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1 transition ${
          saved
            ? "border-sky-400 bg-sky-400/15 text-sky-300"
            : "border-white/15 bg-white/5 hover:bg-white/10"
        }`}
      >
        <span>{saved ? "★" : "☆"}</span>
        <span>{saved ? "Saved" : "Save for later"}</span>
      </button>
    </div>
  );
}
