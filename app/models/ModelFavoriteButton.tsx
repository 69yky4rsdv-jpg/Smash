"use client";

import { useEffect, useState, useTransition } from "react";
import { toggleModelFavoriteAction } from "./actions";

type Props = {
  modelId: string;
  initialFavorited: boolean;
  compact?: boolean;
  className?: string;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      className={filled ? "h-4 w-4" : "h-4 w-4"}
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

export function ModelFavoriteButton({
  modelId,
  initialFavorited,
  compact = false,
  className = "",
}: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited, modelId]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        const result = await toggleModelFavoriteAction(modelId);
        setFavorited(result.favorited);
      } catch {
        // Not signed in
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={`inline-flex items-center justify-center rounded-full border transition disabled:opacity-60 ${
        favorited
          ? "border-pink-400 bg-pink-500/30 text-pink-100 hover:bg-pink-500/40"
          : "border-white/20 bg-black/60 text-neutral-200 hover:border-pink-400/50 hover:bg-black/80 hover:text-pink-200"
      } ${compact ? "h-8 w-8" : "gap-1.5 px-3 py-1.5 text-[11px]"} ${className}`}
    >
      <HeartIcon filled={favorited} />
      {!compact && <span>{favorited ? "Favorited" : "Favorite model"}</span>}
    </button>
  );
}
