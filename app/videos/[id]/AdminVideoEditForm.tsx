"use client";

import { useRef, useState } from "react";
import type { Category, Model, Video } from "@/lib/types";
import { TagMultiSelect } from "../../admin/TagMultiSelect";

type Props = {
  video: Video;
  models: Model[];
  categories: Category[];
  photoUrls: string[];
  updateAction: (formData: FormData) => Promise<void>;
};

export function AdminVideoEditForm({
  video,
  models,
  categories,
  photoUrls,
  updateAction,
}: Props) {
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const effectiveThumb = thumbPreviewUrl ?? video.thumbnailUrl ?? "";

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
          Admin · Edit video
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-100 hover:bg-amber-500/20"
        >
          {open ? "Close" : "Edit"}
        </button>
      </div>

      {open ? (
        <form action={updateAction} className="space-y-3">
          <input type="hidden" name="videoId" value={video.id} />

          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Title</label>
            <input
              name="title"
              defaultValue={video.title}
              required
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-amber-400/30 focus:ring-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Video URL</label>
            <input
              name="videoUrl"
              defaultValue={video.videoUrl}
              required
              placeholder="https://…/playlist.m3u8 or iframe embed"
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-amber-400/30 focus:ring-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                {effectiveThumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={effectiveThumb} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <p className="text-[11px] text-neutral-400">Thumbnail preview</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-neutral-200">Thumbnail URL</label>
              <input
                name="thumbnailUrl"
                defaultValue={video.thumbnailUrl ?? ""}
                ref={thumbnailInputRef}
                onChange={(e) => setThumbPreviewUrl(e.target.value || null)}
                placeholder="https://…"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-amber-400/30 focus:ring-2"
              />
            </div>
            {photoUrls.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[11px] text-neutral-400">Or pick thumbnail from this video’s photos</p>
                <div className="grid max-h-36 grid-cols-4 gap-2 overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-1 sm:grid-cols-6">
                  {photoUrls.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => {
                        setThumbPreviewUrl(url);
                        if (thumbnailInputRef.current) thumbnailInputRef.current.value = url;
                      }}
                      className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                        effectiveThumb === url
                          ? "border-amber-400 ring-1 ring-amber-400/50"
                          : "border-white/15 hover:border-amber-400/60"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Photo gallery URLs</label>
            <textarea
              name="photoUrls"
              defaultValue={photoUrls.join("\n")}
              rows={5}
              placeholder={"One URL per line\nhttps://…/photo1.jpg\nhttps://…/photo2.jpg"}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs outline-none ring-amber-400/30 focus:ring-2 font-mono"
            />
            <p className="text-[10px] text-neutral-500">
              One URL per line (or comma-separated). Saving replaces this video’s photo gallery.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TagMultiSelect
              name="models"
              label="Models"
              items={models.map((m) => ({ id: m.id, label: m.stageName }))}
              selectedIds={video.models ?? []}
            />
            <TagMultiSelect
              name="categories"
              label="Categories"
              items={categories.map((c) => ({ id: c.id, label: c.name }))}
              selectedIds={video.categories ?? []}
            />
          </div>

          <button type="submit" className="btn-gradient px-5 py-2 text-sm">
            Save changes
          </button>
        </form>
      ) : (
        <p className="text-[11px] text-neutral-400">
          Update title, video link, thumbnail, photos, models, and categories without leaving this
          page.
        </p>
      )}
    </div>
  );
}
