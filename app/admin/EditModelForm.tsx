"use client";

import type { Model } from "@/lib/types";
import { useRef, useState } from "react";

const PER_PAGE = 20;

type Props = {
  models: Model[];
  modelPhotoMap: Record<string, string[]>;
  updateModelAction: (formData: FormData) => Promise<void>;
};

export function EditModelForm({ models, modelPhotoMap, updateModelAction }: Props) {
  const [modelId, setModelId] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const normalizedQuery = query.toLowerCase().trim();
  const filteredModels = models.filter((m) =>
    !normalizedQuery ? true : m.stageName.toLowerCase().includes(normalizedQuery)
  );
  const totalPages = Math.max(1, Math.ceil(filteredModels.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * PER_PAGE;
  const pageModels = filteredModels.slice(start, start + PER_PAGE);

  const model = models.find((m) => m.id === modelId);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveAvatarUrl = avatarPreviewUrl ?? model?.avatarUrl ?? "";
  const photoPool = model ? modelPhotoMap[model.id] ?? [] : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="block text-sm text-neutral-200">Models</label>
        <input
          type="search"
          placeholder="Search models…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          className="w-full max-w-xs rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs outline-none ring-accent-pink/30 focus:ring-2"
        />
      </div>

      <ul className="max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-black/40 divide-y divide-white/10">
        {pageModels.length === 0 ? (
          <li className="px-3 py-4 text-xs text-neutral-500">No models match your search.</li>
        ) : (
          pageModels.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  setModelId(m.id);
                  setAvatarPreviewUrl(null);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2 text-xs transition ${
                  modelId === m.id
                    ? "bg-accent-pink/20 text-accent-pinkSoft"
                    : "text-neutral-200 hover:bg-white/10"
                }`}
              >
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gradient-to-tr from-pink-500/40 via-black to-pink-700/40">
                  {m.avatarUrl ? (
                    <img
                      src={m.avatarUrl}
                      alt={m.stageName}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="line-clamp-1">{m.stageName}</span>
                  <span className="text-[10px] text-neutral-500">
                    {m.gender ? `${m.gender === "female" ? "Female" : "Male"} · ` : ""}
                    {m.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </button>
            </li>
          ))
        )}
      </ul>

      {filteredModels.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
          <span>
            Page {currentPage + 1} of {totalPages}
            {normalizedQuery &&
              ` · ${filteredModels.length} result${filteredModels.length === 1 ? "" : "s"}`}
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

      {model && (
        <form
          key={model.id}
          action={updateModelAction}
          className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4"
        >
          <input type="hidden" name="modelId" value={model.id} />

          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Stage name</label>
            <input
              name="stageName"
              defaultValue={model.stageName}
              required
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Short bio</label>
            <input
              name="bio"
              defaultValue={model.bio ?? ""}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-tr from-pink-500/40 via-black to-pink-700/40">
                {effectiveAvatarUrl ? (
                  <img
                    src={effectiveAvatarUrl}
                    alt={model.stageName}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="text-[11px] text-neutral-400">
                <p>Current profile photo (if set).</p>
                <p className="text-[10px]">
                  You can paste a URL below, or auto-fill from this model&apos;s scene photos.
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
                    setAvatarPreviewUrl(first);
                    if (avatarInputRef.current) {
                      avatarInputRef.current.value = first;
                    }
                  }}
                  className="rounded-full bg-accent-pink/20 px-3 py-1.5 text-[11px] font-medium text-accent-pink hover:bg-accent-pink/30"
                >
                  Auto set from first scene photo
                </button>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs text-neutral-200">Profile photo URL</label>
              <input
                name="avatarUrl"
                defaultValue={model.avatarUrl ?? ""}
                ref={avatarInputRef}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
              />
            </div>
            {photoPool.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] text-neutral-400">
                  Or pick a profile photo from this model&apos;s video photo gallery:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 max-h-40 overflow-y-auto p-0.5 rounded-lg border border-white/10 bg-black/40">
                  {photoPool.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => {
                        setAvatarPreviewUrl(url);
                        if (avatarInputRef.current) {
                          avatarInputRef.current.value = url;
                        }
                      }}
                      className={`relative aspect-square min-w-0 overflow-hidden rounded-md border-2 transition-all duration-150 active:scale-[0.98] ${
                        effectiveAvatarUrl === url
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
            <label className="text-xs text-neutral-200">Gender (for models page)</label>
            <select
              name="gender"
              defaultValue={model.gender ?? ""}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            >
              <option value="">— Not set —</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-xs text-neutral-200">
                Gallery image URLs (one per line or comma-separated; short form cdn.net/... supported)
              </label>
              <textarea
                name="gallery"
                rows={4}
                defaultValue={model.galleryUrls?.join("\n") ?? ""}
                placeholder={"https://.../img1.jpg\ncdn.net/.../IMG_0001.JPG"}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2 font-mono text-xs"
              />
            </div>
            {photoPool.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] text-neutral-400">
                  Scene photos from this model&apos;s videos (preview only):
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 max-h-52 overflow-y-auto p-0.5 rounded-lg border border-white/10 bg-black/40">
                  {photoPool.map((url) => (
                    <div
                      key={url}
                      className="relative aspect-square min-w-0 overflow-hidden rounded-md bg-neutral-900"
                    >
                      <img
                        src={url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              value="true"
              id="edit-model-active"
              defaultChecked={model.active}
              className="h-3 w-3 rounded border-white/20 bg-black/70"
            />
            <label htmlFor="edit-model-active" className="text-xs text-neutral-200">
              Active (visible on site)
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
