"use client";

import type { Model, Video } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Props = {
  videos: Video[];
  models: Model[];
  likedVideoIds: string[];
  favoriteModelIds: string[];
};

type Tab = "saved" | "liked" | "models";

function getStoredIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function ProfileClient({ videos, models, likedVideoIds, favoriteModelIds }: Props) {
  const [tab, setTab] = useState<Tab>("saved");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(getStoredIds("vs-saved-videos"));
  }, []);

  const likedVideos = useMemo(
    () => videos.filter((v) => likedVideoIds.includes(v.id)),
    [videos, likedVideoIds]
  );
  const favoriteModels = useMemo(
    () => models.filter((m) => favoriteModelIds.includes(m.id)),
    [models, favoriteModelIds]
  );
  const savedVideos = useMemo(
    () => videos.filter((v) => savedIds.includes(v.id)),
    [videos, savedIds]
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-pink" />
          <div>
            <h1 className="text-xl font-semibold text-neutral-50">Your library</h1>
            <p className="text-xs text-neutral-400">
              Liked videos and favorite models sync to your account. Saved videos are stored in
              your browser.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setTab("saved")}
className={`rounded-lg px-3 py-1.5 ${
              tab === "saved"
              ? "bg-pink-400 text-white"
              : "bg-white/5 text-neutral-200 hover:bg-white/10"
          }`}
        >
          Saved videos
        </button>
        <button
          type="button"
          onClick={() => setTab("liked")}
className={`rounded-lg px-3 py-1.5 ${
              tab === "liked"
              ? "bg-pink-400 text-white"
              : "bg-white/5 text-neutral-200 hover:bg-white/10"
          }`}
        >
          Liked videos
        </button>
        <button
          type="button"
          onClick={() => setTab("models")}
          className={`rounded-lg px-3 py-1.5 ${
            tab === "models"
              ? "bg-pink-400 text-white"
              : "bg-white/5 text-neutral-200 hover:bg-white/10"
          }`}
        >
          Favorite models
        </button>
      </div>

      {tab === "saved" && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-100">Saved for later</h2>
          {savedVideos.length === 0 ? (
            <p className="text-xs text-neutral-500">
              You haven&apos;t saved any videos yet. Tap &quot;Save for later&quot; on a scene to
              add it here.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedVideos.map((video) => (
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
            </div>
          )}
        </section>
      )}

      {tab === "liked" && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-100">Liked videos</h2>
          {likedVideos.length === 0 ? (
            <p className="text-xs text-neutral-500">
              You haven&apos;t liked any videos yet. Tap the heart on a scene to add it here.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {likedVideos.map((video) => (
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
            </div>
          )}
        </section>
      )}
      {tab === "models" && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-100">Favorite models</h2>
          {favoriteModels.length === 0 ? (
            <p className="text-xs text-neutral-500">
              You haven&apos;t favorited any models yet. Tap the heart on a model to add them here.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {favoriteModels.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.id}`}
                  className="card-surface overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-accent-pink/60"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-pink">
                    {model.avatarUrl ? (
                      <img
                        src={model.avatarUrl}
                        alt={model.stageName}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <p className="p-3 text-sm font-semibold text-neutral-50">{model.stageName}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

