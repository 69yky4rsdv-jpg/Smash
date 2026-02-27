"use client";

import { useEffect, useState } from "react";

type Props = {
  videoId: string;
};

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

export function VideoEngagementControls({ videoId }: Props) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const likedIds = getStoredIds("vs-liked-videos");
    const savedIds = getStoredIds("vs-saved-videos");
    setLiked(likedIds.includes(videoId));
    setSaved(savedIds.includes(videoId));
  }, [videoId]);

  function toggle(key: "vs-liked-videos" | "vs-saved-videos", setter: (value: boolean) => void) {
    const ids = getStoredIds(key);
    const index = ids.indexOf(videoId);
    if (index === -1) {
      ids.push(videoId);
      setter(true);
    } else {
      ids.splice(index, 1);
      setter(false);
    }
    setStoredIds(key, ids);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-300">
      <button
        type="button"
        onClick={() => toggle("vs-liked-videos", setLiked)}
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${
          liked
            ? "border-accent-pink bg-accent-pink/20 text-accent-pink"
            : "border-white/15 bg-white/5 hover:bg-white/10"
        }`}
      >
        <span>{liked ? "♥" : "♡"}</span>
        <span>{liked ? "Liked" : "Like video"}</span>
      </button>
      <button
        type="button"
        onClick={() => toggle("vs-saved-videos", setSaved)}
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${
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

