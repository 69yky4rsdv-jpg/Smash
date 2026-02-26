"use client";

import type { Category } from "@/lib/types";
import type { Video } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  categories: Category[];
  videos: Video[];
};

export function CategoriesClient({ categories, videos }: Props) {
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");

  const filteredVideos = useMemo(() => {
    let list = categoryId
      ? videos.filter((v) => v.categories && v.categories.includes(categoryId))
      : [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((v) => v.title.toLowerCase().includes(q));
    }
    return list;
  }, [videos, categoryId, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="category-select" className="text-sm text-neutral-300 whitespace-nowrap">
            Category
          </label>
          <select
            id="category-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-neutral-100 outline-none ring-accent-pink/30 focus:ring-2 sm:w-48"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="category-search" className="text-sm text-neutral-300 whitespace-nowrap">
            Search
          </label>
          <input
            id="category-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by video title…"
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2 sm:max-w-xs"
          />
        </div>
      </div>

      {!categoryId ? (
        <p className="text-sm text-neutral-500">Select a category to see videos.</p>
      ) : (
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
      )}
    </div>
  );
}
