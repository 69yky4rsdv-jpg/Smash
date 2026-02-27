"use client";

import type { Category, Model, Video } from "@/lib/types";
import { useActionState, useState } from "react";
import { TagMultiSelect } from "./TagMultiSelect";

type Props = {
  videos: Video[];
  categories: Category[];
  models: Model[];
  updateVideoAction: (formData: FormData) => Promise<void>;
};

export function EditVideoForm({ videos, categories, models, updateVideoAction }: Props) {
  const [videoId, setVideoId] = useState("");
  const video = videos.find((v) => v.id === videoId);

  return (
    <div className="space-y-4">
      <label className="block text-sm text-neutral-200">Select video to edit</label>
      <select
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
        className="w-full max-w-md rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
      >
        <option value="">— Choose a video —</option>
        {videos.map((v) => (
          <option key={v.id} value={v.id}>
            {v.title}
          </option>
        ))}
      </select>

      {video && (
        <form action={updateVideoAction} className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
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
