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
  const [pending, setPending] = useState<string | null>(null);

  if (!photoUrls.length) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
        <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
          Admin — Choose thumbnail
        </p>
        <p className="text-[11px] text-neutral-400">
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
    setPending(url);
    try {
      await setThumbnailAction(videoId, url);
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
      <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
        Admin — Choose thumbnail
      </p>
      <p className="text-[11px] text-neutral-400">
        Click a photo to set it as this video’s thumbnail. Visible only to admins.
      </p>
      <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
        {photoUrls.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => handleSelect(url)}
            disabled={pending !== null}
            className={`shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden focus:ring-2 ring-amber-400/50 focus:outline-none transition ${
              currentThumbnailUrl === url
                ? "border-amber-400 ring-2 ring-amber-400/50"
                : "border-white/20 hover:border-amber-400/50"
            } ${pending ? "opacity-70 pointer-events-none" : ""}`}
          >
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>
      {pending && (
        <p className="text-[11px] text-amber-300">Updating…</p>
      )}
    </div>
  );
}
