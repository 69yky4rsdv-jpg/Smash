"use client";

import type { Video } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  videos: Video[];
  categoryName: string;
};

export function CategoryVideosClient({ videos, categoryName }: Props) {
  const [search, setSearch] = useState("");

  const filteredVideos = useMemo(() => {
    if (!search.trim()) return videos;
    const q = search.toLowerCase();
    return videos.filter((v) => v.title.toLowerCase().includes(q));
  }, [videos, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-neutral-400">
          {filteredVideos.length} of {videos.length} videos
          {search ? " matching your search" : ""}
        </p>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search in ${categoryName}…`}
          className="w-full max-w-xs rounded-lg border border-white/10 bg-black/60 px-4 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredVideos.map((video) => (
          <Link key={video.id} href={`/videos/${video.id}`} className="group">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-tr from-pink-500/30 via-black to-pink-700/40" />
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium text-neutral-100 line-clamp-2 group-hover:text-accent-pinkSoft">
              {video.title}
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              {new Date(video.publishedAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
        {filteredVideos.length === 0 && (
          <p className="col-span-full text-sm text-neutral-500">
            No videos in this category{search ? " matching your search" : ""}.
          </p>
        )}
      </div>
    </div>
  );
}
