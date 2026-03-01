"use client";

import type { Category, Model, Video } from "@/lib/types";
import { useState } from "react";
import { TagMultiSelect } from "./TagMultiSelect";

const PER_PAGE = 20;

type Props = {
  videos: Video[];
  categories: Category[];
  models: Model[];
  updateVideoAction: (formData: FormData) => Promise<void>;
};

export function EditVideoForm({ videos, categories, models, updateVideoAction }: Props) {
  const [videoId, setVideoId] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const normalizedQuery = query.toLowerCase().trim();
  const filteredVideos = videos.filter((v) =>
    !normalizedQuery ? true : v.title.toLowerCase().includes(normalizedQuery)
  );
  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * PER_PAGE;
  const pageVideos = filteredVideos.slice(start, start + PER_PAGE);

  const video = videos.find((v) => v.id === videoId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="block text-sm text-neutral-200">Videos</label>
        <input
          type="search"
          placeholder="Search videos…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          className="w-full max-w-xs rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs outline-none ring-accent-pink/30 focus:ring-2"
        />
      </div>

      <ul className="max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-black/40 divide-y divide-white/10">
        {pageVideos.length === 0 ? (
          <li className="px-3 py-4 text-xs text-neutral-500">No videos match your search.</li>
        ) : (
          pageVideos.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => setVideoId(v.id)}
                className={`block w-full text-left px-3 py-2 text-xs transition ${
                  videoId === v.id
                    ? "bg-accent-pink/20 text-accent-pinkSoft"
                    : "text-neutral-200 hover:bg-white/10"
                }`}
              >
                <span className="line-clamp-2">{v.title}</span>
                <span className="text-[10px] text-neutral-500">
                  {new Date(v.publishedAt).toLocaleDateString()}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>

      {filteredVideos.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
          <span>
            Page {currentPage + 1} of {totalPages}
            {normalizedQuery && ` · ${filteredVideos.length} result${filteredVideos.length === 1 ? "" : "s"}`}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {video && (
        <form
          key={video.id}
          action={updateVideoAction}
          className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4"
        >
          <input type="hidden" name="videoId" value={video.id} />
          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Title</label>
            <input
              name="title"
              defaultValue={video.title}
              required
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Description</label>
            <textarea
              name="description"
              defaultValue={video.description ?? ""}
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Thumbnail URL</label>
            <input
              name="thumbnailUrl"
              defaultValue={video.thumbnailUrl ?? ""}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            />
            <p className="text-[11px] text-neutral-500">To pick a thumbnail from this video’s photo gallery, open the video scene page (as admin) and use “Admin — Choose thumbnail” there.</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Video URL</label>
            <input
              name="videoUrl"
              defaultValue={video.videoUrl}
              required
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Published date</label>
            <input
              type="date"
              name="publishedAt"
              defaultValue={video.publishedAt ? video.publishedAt.slice(0, 10) : ""}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TagMultiSelect
              name="categories"
              label="Categories"
              items={categories.map((c) => ({ id: c.id, label: c.name }))}
              selectedIds={video.categories ?? []}
            />
            <TagMultiSelect
              name="models"
              label="Models"
              items={models.map((m) => ({ id: m.id, label: m.stageName }))}
              selectedIds={video.models ?? []}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isTrending"
              value="true"
              id="edit-video-trending"
              defaultChecked={video.isTrending}
              className="h-3 w-3 rounded border-white/20 bg-black/70"
            />
            <label htmlFor="edit-video-trending" className="text-xs text-neutral-200">
              Trending
            </label>
          </div>
          <button type="submit" className="btn-gradient w-full justify-center text-sm">
            Save changes
          </button>
        </form>
      )}
    </div>
  );
}
