"use client";

import { useState } from "react";
import Link from "next/link";
import type { GridPhoto } from "@/lib/data";

const DEFAULT_MAX_PHOTOS = 30;

type Props = {
  siteName: string;
  allPhotos: GridPhoto[];
  selectedIds: string[];
  isAdmin: boolean;
  saveAction: (formData: FormData) => Promise<void>;
  addPhotosAction: (formData: FormData) => Promise<void>;
  maxPhotos?: number;
  removePhotoAction: (formData: FormData) => Promise<void>;
};

export function GridPageClient({
  siteName,
  allPhotos,
  selectedIds,
  isAdmin,
  saveAction,
  addPhotosAction,
   removePhotoAction,
  maxPhotos = DEFAULT_MAX_PHOTOS,
}: Props) {
  const [selecting, setSelecting] = useState(false);
  const [showAddPhotos, setShowAddPhotos] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(() => new Set(selectedIds));
  const [order, setOrder] = useState<string[]>(() => selectedIds);
  const [reordering, setReordering] = useState(false);

  const selectedPhotos = order
    .map((id) => allPhotos.find((p) => p.id === id))
    .filter((p): p is GridPhoto => p != null);
  const displayPhotos = selecting ? allPhotos : selectedPhotos;

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < maxPhotos) {
        next.add(id);
        // Newly checked photos go to the end of the order.
        setOrder((prevOrder) => (prevOrder.includes(id) ? prevOrder : [...prevOrder, id]));
      }
      return next;
    });
    // When unchecking, also drop from order.
    setOrder((prevOrder) => prevOrder.filter((x) => x !== id));
  };

  const selectAll = () => {
    const ids = allPhotos.slice(0, maxPhotos).map((p) => p.id);
    setChecked(new Set(ids));
    setOrder(ids);
  };
  const clearAll = () => {
    setChecked(new Set());
    setOrder([]);
  };

  const handleSave = () => {
    const formData = new FormData();
    const orderedIds = order.filter((id) => checked.has(id)).slice(0, maxPhotos);
    orderedIds.forEach((id) => formData.append("photoIds", id));
    saveAction(formData).then(() => {
      setSelecting(false);
      setReordering(false);
      window.location.reload();
    });
  };

  const handleSaveOrder = () => {
    const formData = new FormData();
    order.slice(0, maxPhotos).forEach((id) => formData.append("photoIds", id));
    saveAction(formData).then(() => {
      setReordering(false);
      window.location.reload();
    });
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    setOrder((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const handleAddPhotos = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    addPhotosAction(formData).then(() => {
      form.reset();
      setShowAddPhotos(false);
      window.location.reload();
    });
  };

  const handleRemovePhoto = (id: string) => {
    const formData = new FormData();
    formData.append("photoId", id);
    removePhotoAction(formData).then(() => {
      window.location.reload();
    });
  };

  return (
    <div className="min-h-screen w-full bg-black">
      {/* Header: site name centered, Join Now on the right */}
      <header className="border-b border-white/10 bg-black pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="mx-auto grid max-w-[1600px] grid-cols-3 items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
          <div className="min-w-0" />
          <Link
            href="/start"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-center text-lg font-bold uppercase tracking-[0.2em] text-pink-200 hover:text-pink-100 sm:text-2xl sm:tracking-[0.25em] md:text-3xl"
            style={{ fontFamily: '"Zing Rust", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
          >
            {siteName}
          </Link>
          <div className="flex min-h-[44px] items-center justify-end">
            <Link
              href="/start"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-green-500 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-green-400 hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black sm:px-5"
            >
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {isAdmin && (
        <div className="fixed top-14 left-2 right-2 z-50 flex flex-wrap items-center justify-center gap-2 rounded-lg border border-white/20 bg-black/90 px-3 py-2 text-sm shadow-xl sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2">
          {!selecting ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setReordering(false);
                  setSelecting(true);
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded bg-white/15 px-3 py-2 font-medium text-white hover:bg-white/25"
              >
                Select photos
              </button>
              <button
                type="button"
                onClick={() => setShowAddPhotos((v) => !v)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded bg-white/15 px-3 py-2 font-medium text-white hover:bg-white/25"
              >
                Add photos
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelecting(false);
                  setReordering((v) => !v);
                }}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded px-3 py-2 font-medium ${
                  reordering ? "bg-accent-pink/80 text-white hover:bg-accent-pink" : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {reordering ? "Reordering…" : "Reorder"}
              </button>
              {reordering && (
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded bg-accent-pink/80 px-3 py-2 font-medium text-white hover:bg-accent-pink"
                >
                  Save order
                </button>
              )}
            </>
          ) : (
            <>
              <span className="flex min-h-[44px] items-center text-xs text-neutral-400">
                {checked.size}/{maxPhotos}
              </span>
              <button
                type="button"
                onClick={selectAll}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded bg-white/10 px-2 py-2 text-xs text-neutral-200 hover:bg-white/20"
              >
                All
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded bg-white/10 px-2 py-2 text-xs text-neutral-200 hover:bg-white/20"
              >
                None
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded bg-accent-pink/80 px-3 py-2 font-medium text-white hover:bg-accent-pink"
              >
                Save selection
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelecting(false);
                  setChecked(new Set(selectedIds));
                  setOrder(selectedIds);
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded bg-white/10 px-2 py-2 text-xs text-neutral-300 hover:bg-white/20"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      {/* Add photos form (admin) */}
      {isAdmin && showAddPhotos && (
        <div className="fixed left-2 right-2 top-28 z-50 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border border-white/20 bg-black/95 p-4 shadow-xl sm:left-1/2 sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2">
          <h3 className="mb-2 text-sm font-semibold text-white">Add photos by URL</h3>
          <p className="mb-3 text-xs text-neutral-400">
            Paste image URLs, one per line or comma-separated. New photos are added to the grid and selected.
          </p>
          <form onSubmit={handleAddPhotos} className="space-y-2">
            <textarea
              name="photoUrls"
              rows={4}
              placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:border-accent-pink/50 focus:outline-none focus:ring-1 focus:ring-accent-pink/50"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded bg-accent-pink/80 px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-pink"
              >
                Add to grid
              </button>
              <button
                type="button"
                onClick={() => setShowAddPhotos(false)}
                className="rounded bg-white/10 px-3 py-1.5 text-sm text-neutral-300 hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 sm:py-5 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] ${isAdmin ? "pt-20" : ""}`}>
        {/* Masonry-style columns: make tiles consistent size across orientations */}
        <div
          className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 lg:gap-5"
          style={{ columnFill: "balance" }}
        >
          {displayPhotos.map((photo, index) => {
            const isAboveFold = index < 8;
            return (
              <div
                key={photo.id}
                className="group relative mb-3 break-inside-avoid sm:mb-4 lg:mb-5"
              >
                {selecting && isAdmin && (
                  <label
                    className={`absolute left-2 top-2 z-10 flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded border-2 border-white bg-black/70 shadow-lg ${
                      !checked.has(photo.id) && checked.size >= maxPhotos
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    }`}
                    title={
                      !checked.has(photo.id) && checked.size >= maxPhotos
                        ? `Max ${maxPhotos} photos`
                        : undefined
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked.has(photo.id)}
                      onChange={() => toggle(photo.id)}
                      disabled={!checked.has(photo.id) && checked.size >= maxPhotos}
                      className="sr-only"
                    />
                    {checked.has(photo.id) ? (
                      <span className="text-sm text-white" aria-hidden>✓</span>
                    ) : (
                      <span className="h-3 w-3 rounded bg-transparent" />
                    )}
                  </label>
                )}
                {!selecting && isAdmin && (
                  <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1">
                    {reordering && (
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => movePhoto(index, index - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded bg-black/70 text-xs text-white hover:bg-black"
                          aria-label="Move photo up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => movePhoto(index, index + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded bg-black/70 text-xs text-white hover:bg-black"
                          aria-label="Move photo down"
                        >
                          ↓
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="flex h-7 items-center justify-center rounded bg-red-600/80 px-2 text-[10px] font-semibold uppercase tracking-wide text-white shadow hover:bg-red-500"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {selecting ? (
                  <div className="block overflow-hidden rounded-lg bg-neutral-900">
                    <img
                      src={photo.url}
                      alt=""
                      loading={isAboveFold ? "eager" : "lazy"}
                      decoding="async"
                      {...(isAboveFold ? { fetchPriority: "high" as const } : {})}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="block w-full h-auto object-contain max-h-[480px] transition-transform group-hover:scale-[1.02]"
                    />
                  </div>
                ) : (
                  <Link
                    href="/start"
                    className="block overflow-hidden rounded-lg bg-neutral-900"
                  >
                    <img
                      src={photo.url}
                      alt=""
                      loading={isAboveFold ? "eager" : "lazy"}
                      decoding="async"
                      {...(isAboveFold ? { fetchPriority: "high" as const } : {})}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="block w-full h-auto object-contain max-h-[480px] transition-transform group-hover:scale-[1.02]"
                    />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with Unlock now */}
      <footer className="border-t border-white/10 bg-black/60 py-6 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-8">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-center gap-4 px-4">
          <Link
            href="/start"
            className="min-h-[48px] inline-flex min-w-[200px] items-center justify-center rounded-lg bg-green-500 px-8 py-4 text-base font-bold uppercase tracking-wider text-white transition hover:bg-green-400 hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black"
          >
            Unlock now
          </Link>
          <p className="text-xs text-neutral-500">
            Start your membership to access exclusive content
          </p>
        </div>
      </footer>
    </div>
  );
}
