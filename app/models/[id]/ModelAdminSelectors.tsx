"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageCropper } from "../../components/ImageCropper";

type Props = {
  modelId: string;
  currentAvatarUrl: string | undefined;
  currentGalleryUrls: string[];
  photoPoolUrls: string[];
  setAvatarAction: (modelId: string, avatarUrl: string) => Promise<void>;
  setRandomAvatarAction: (modelId: string) => Promise<void>;
  addGalleryUrlsAction: (modelId: string, urls: string[]) => Promise<void>;
};

export function ModelAdminSelectors({
  modelId,
  currentAvatarUrl,
  currentGalleryUrls,
  photoPoolUrls,
  setAvatarAction,
  setRandomAvatarAction,
  addGalleryUrlsAction,
}: Props) {
  const router = useRouter();
  const [pendingAvatar, setPendingAvatar] = useState(false);
  const [pendingGallery, setPendingGallery] = useState(false);
  const [selectedForGallery, setSelectedForGallery] = useState<Set<string>>(new Set());
  const [cropProfileUrl, setCropProfileUrl] = useState<string | null>(null);
  const [cropGalleryUrls, setCropGalleryUrls] = useState<string[] | null>(null);

  const existingGallerySet = new Set(currentGalleryUrls);

  if (!photoPoolUrls.length) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-2">
        <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
          Admin — Profile & gallery from scene photos
        </p>
        <p className="text-[11px] sm:text-xs text-neutral-400">
          No scene photos for this model yet. Add video photos in{" "}
          <Link href="/admin#import" className="text-amber-300 hover:text-amber-200 underline">
            Admin → Import PhotoSets
          </Link>
          , then refresh this page to set profile picture or gallery from those photos.
        </p>
      </div>
    );
  }

  function handleOpenProfileCrop(url: string) {
    setCropProfileUrl(url);
  }

  async function handleProfileCropComplete(dataUrl: string) {
    setCropProfileUrl(null);
    setPendingAvatar(true);
    try {
      await setAvatarAction(modelId, dataUrl);
      router.refresh();
    } finally {
      setPendingAvatar(false);
    }
  }

  function handleAddToGalleryWithCropped(urls: string[]) {
    if (urls.length === 0) return;
    setPendingGallery(true);
    setCropGalleryUrls(urls);
  }

  async function handleGalleryCropComplete(dataUrl: string) {
    if (!cropGalleryUrls || cropGalleryUrls.length === 0) {
      setCropGalleryUrls(null);
      setPendingGallery(false);
      return;
    }
    const remaining = cropGalleryUrls.slice(1);
    try {
      await addGalleryUrlsAction(modelId, [dataUrl]);
      if (remaining.length > 0) {
        setCropGalleryUrls(remaining);
      } else {
        setCropGalleryUrls(null);
        setSelectedForGallery(new Set());
        setPendingGallery(false);
        router.refresh();
      }
    } catch {
      setCropGalleryUrls(null);
      setPendingGallery(false);
    }
  }

  async function handleSetRandomAvatar() {
    setPendingAvatar(true);
    try {
      await setRandomAvatarAction(modelId);
      router.refresh();
    } finally {
      setPendingAvatar(false);
    }
  }

  function toggleGallerySelection(url: string) {
    setSelectedForGallery((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  async function handleAddToGallery() {
    const urls = [...selectedForGallery].filter((u) => !existingGallerySet.has(u));
    if (urls.length === 0) return;
    setPendingGallery(true);
    try {
      await addGalleryUrlsAction(modelId, urls);
      setSelectedForGallery(new Set());
      router.refresh();
    } finally {
      setPendingGallery(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-5 sm:space-y-6">
      <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
        Admin — Profile & gallery from scene photos
      </p>
      <p className="text-[11px] sm:text-xs text-neutral-400">
        Photos below are from video galleries for this model’s scenes. Tap or click to set profile picture or add to the model gallery.
      </p>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSetRandomAvatar}
            disabled={pendingAvatar}
            className="rounded-lg border border-amber-400/50 bg-amber-500/20 px-3 py-2 sm:py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/30 disabled:opacity-50 min-h-[44px] sm:min-h-0 touch-manipulation"
          >
            Set random profile picture
          </button>
        </div>
        <p className="text-[11px] sm:text-xs text-neutral-500">Or tap a photo to set as profile picture:</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 max-h-44 sm:max-h-52 overflow-y-auto overflow-x-hidden overscroll-behavior-contain scroll-smooth p-0.5">
          {photoPoolUrls.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => handleOpenProfileCrop(url)}
              disabled={pendingAvatar}
              className={`relative aspect-square min-w-0 rounded-lg border-2 overflow-hidden focus:ring-2 ring-amber-400/50 focus:outline-none transition-all duration-150 active:scale-[0.98] ${
                currentAvatarUrl === url
                  ? "border-amber-400 ring-2 ring-amber-400/50"
                  : "border-white/20 hover:border-amber-400/50"
              } ${pendingAvatar ? "opacity-70 pointer-events-none" : ""}`}
            >
              <img
                src={url}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
        {pendingAvatar && <p className="text-[11px] sm:text-xs text-amber-300">Updating…</p>}
      </div>

      <div className="pt-4 border-t border-white/10 space-y-2">
        <p className="text-[11px] sm:text-xs text-neutral-400">Add to model gallery (select one or more, then Add):</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 max-h-52 sm:max-h-64 overflow-y-auto overflow-x-hidden overscroll-behavior-contain scroll-smooth p-0.5">
          {photoPoolUrls.map((url) => {
            const inGallery = existingGallerySet.has(url);
            const selected = selectedForGallery.has(url);
            return (
              <button
                key={url}
                type="button"
                onClick={() => !inGallery && toggleGallerySelection(url)}
                className={`relative aspect-square min-w-0 rounded-lg border-2 overflow-hidden focus:ring-2 ring-amber-400/50 focus:outline-none transition-all duration-150 active:scale-[0.98] ${
                  inGallery
                    ? "border-emerald-500/50 opacity-75 cursor-default"
                    : selected
                      ? "border-amber-400 ring-2 ring-amber-400/50"
                      : "border-white/20 hover:border-amber-400/50"
                } ${pendingGallery ? "opacity-70 pointer-events-none" : ""}`}
              >
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {inGallery && (
                  <span className="absolute inset-0 flex items-center justify-center bg-emerald-900/70 text-[10px] text-white font-medium">
                    In gallery
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selectedForGallery.size > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAddToGallery}
              disabled={pendingGallery}
              className="rounded-lg bg-amber-500/30 px-3 py-2 sm:py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/40 disabled:opacity-50 min-h-[44px] sm:min-h-0 touch-manipulation"
            >
              Add {selectedForGallery.size} to gallery
            </button>
            <button
              type="button"
              onClick={() => handleAddToGalleryWithCropped([...selectedForGallery].filter((u) => !existingGallerySet.has(u)))}
              disabled={pendingGallery}
              className="rounded-lg border border-amber-400/50 px-3 py-2 sm:py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/20 disabled:opacity-50 min-h-[44px] sm:min-h-0 touch-manipulation"
            >
              Add with crop ({selectedForGallery.size})
            </button>
          </div>
        )}
        {pendingGallery && <p className="text-[11px] sm:text-xs text-amber-300">Adding…</p>}
      </div>

      {cropProfileUrl && (
        <ImageCropper
          imageUrl={cropProfileUrl}
          aspectRatio={1}
          maxOutputSize={400}
          onComplete={handleProfileCropComplete}
          onCancel={() => setCropProfileUrl(null)}
        />
      )}
      {cropGalleryUrls && cropGalleryUrls[0] && (
        <ImageCropper
          key={cropGalleryUrls[0]}
          imageUrl={cropGalleryUrls[0]}
          aspectRatio={3 / 4}
          maxOutputSize={1200}
          onComplete={handleGalleryCropComplete}
          onCancel={() => setCropGalleryUrls(null)}
        />
      )}
    </div>
  );
}
