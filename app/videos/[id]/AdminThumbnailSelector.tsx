"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  videoId: string;
  currentThumbnailUrl: string | undefined;
  photoUrls: string[];
  setThumbnailAction: (videoId: string, thumbnailUrl: string) => Promise<void>;
};

export function AdminThumbnailSelector({
  videoId,
  currentThumbnailUrl,
  photoUrls,
  setThumbnailAction,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [optimisticUrl, setOptimisticUrl] = useState<string | null>(null);
  const effectiveThumbnail = optimisticUrl ?? currentThumbnailUrl;

  if (!photoUrls.length) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-2">
        <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
          Admin — Choose thumbnail
        </p>
        <p className="text-[11px] sm:text-xs text-neutral-400">
          No photos for this video yet. Add photos in{" "}
          <Link href="/admin#import" className="text-amber-300 hover:text-amber-200 underline">
            Admin → Import PhotoSets
          </Link>
          , then refresh this page to pick a thumbnail.
        </p>
      </div>
    );
  }

  async function handleSelect(url: string) {
    setOptimisticUrl(url);
    setPending(true);
    try {
      await setThumbnailAction(videoId, url);
      router.refresh();
    } finally {
      setPending(false);
      setOptimisticUrl(null);
    }
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-3">
      <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
        Admin — Choose thumbnail
      </p>
      <p className="text-[11px] sm:text-xs text-neutral-400">
        Tap or click a photo to set it as this video’s thumbnail. Visible only to admins.
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 max-h-48 sm:max-h-64 md:max-h-80 overflow-y-auto overflow-x-hidden overscroll-behavior-contain scroll-smooth p-0.5">
        {photoUrls.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => handleSelect(url)}
            disabled={pending}
            className={`relative aspect-square min-w-0 rounded-lg border-2 overflow-hidden focus:ring-2 ring-amber-400/50 focus:outline-none transition-all duration-150 active:scale-[0.98] touch-manipulation ${
              effectiveThumbnail === url
                ? "border-amber-400 ring-2 ring-amber-400/50"
                : "border-white/20 hover:border-amber-400/50"
            } ${pending ? "opacity-70 pointer-events-none" : ""}`}
          >
            <img
              src={url}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>
      {pending && (
        <p className="text-[11px] sm:text-xs text-amber-300">Updating…</p>
      )}
    </div>
  );
}
