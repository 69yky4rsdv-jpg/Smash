"use client";

import type { Category, Model, Video } from "@/lib/types";
import { useRef, useState } from "react";
import { TagMultiSelect } from "./TagMultiSelect";

const PER_PAGE = 20;

type Props = {
  videos: Video[];
  categories: Category[];
  models: Model[];
  updateVideoAction: (formData: FormData) => Promise<void>;
  videoPhotoMap: Record<string, string[]>;
};

export function EditVideoForm({
  videos,
  categories,
  models,
  updateVideoAction,
  videoPhotoMap
}: Props) {
  const [videoId, setVideoId] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string | null>(null);

  const normalizedQuery = query.toLowerCase().trim();
  const filteredVideos = videos.filter((v) =>
    !normalizedQuery ? true : v.title.toLowerCase().includes(normalizedQuery)
  );
  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * PER_PAGE;
  const pageVideos = filteredVideos.slice(start, start + PER_PAGE);

  const video = videos.find((v) => v.id === videoId);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const effectiveThumb = thumbPreviewUrl ?? video?.thumbnailUrl ?? "";

  const photoPool = video ? videoPhotoMap[video.id] ?? [] : [];

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
                onClick={() => {
                  setVideoId(v.id);
                  setThumbPreviewUrl(null);
                }}
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
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-tr from-pink-500/40 via-black to-pink-700/40">
                {effectiveThumb ? (
                  <img
                    src={effectiveThumb}
                    alt={video.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="text-[11px] text-neutral-400">
                <p>Current thumbnail preview.</p>
                <p className="text-[10px]">
                  You can paste a URL below, auto-fill from scene photos, or pick from this
                  video&apos;s photo gallery.
                </p>
              </div>
            </div>
            {photoPool.length > 0 && (
              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    const first = photoPool[0];
                    if (!first) return;
                    setThumbPreviewUrl(first);
                    if (thumbnailInputRef.current) {
                      thumbnailInputRef.current.value = first;
                    }
                  }}
                  className="rounded-full bg-accent-pink/20 px-3 py-1.5 text-[11px] font-medium text-accent-pink hover:bg-accent-pink/30"
                >
                  Auto set from first scene photo
                </button>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs text-neutral-200">Thumbnail URL</label>
              <input
                name="thumbnailUrl"
                defaultValue={video.thumbnailUrl ?? ""}
                ref={thumbnailInputRef}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                onChange={(e) => setThumbPreviewUrl(e.target.value || null)}
              />
            </div>
            {photoPool.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] text-neutral-400">
                  Or pick a thumbnail from this video&apos;s photo gallery:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 max-h-40 overflow-y-auto p-0.5 rounded-lg border border-white/10 bg-black/40">
                  {photoPool.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => {
                        setThumbPreviewUrl(url);
                        if (thumbnailInputRef.current) {
                          thumbnailInputRef.current.value = url;
                        }
                      }}
                      className={`relative aspect-square min-w-0 overflow-hidden rounded-md border-2 transition-all duration-150 active:scale-[0.98] ${
                        effectiveThumb === url
                          ? "border-accent-pink ring-1 ring-accent-pink/60"
                          : "border-white/15 hover:border-accent-pink/70"
                      }`}
                    >
                      <img
                        src={url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
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
