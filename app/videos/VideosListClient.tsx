"use client";

import type { Video } from "@/lib/types";
import { useMemo, useState } from "react";
import { VideoCardWithPreview } from "./VideoCardWithPreview";

type Props = {
  videos: Video[];
};

export function VideosListClient({ videos }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        (v.description?.toLowerCase().includes(q))
    );
  }, [videos, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="videos-search" className="text-sm text-neutral-300">
          Search
        </label>
        <input
          id="videos-search"
          type="search"
          placeholder="Search by title or description…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2 sm:max-w-sm"
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((video) => (
          <VideoCardWithPreview key={video.id} video={video} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-neutral-500">
          {query.trim() ? "No videos match your search." : "No videos yet."}
        </p>
      )}
    </div>
  );
}
