"use client";

import type { Model } from "@/lib/types";
import type { VideoEngagement } from "@/lib/video-engagement";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LikePercentBadge } from "./LikePercentBadge";
import { ModelFavoriteButton } from "./ModelFavoriteButton";

type Props = {
  models: Model[];
  engagementByModelId: Record<string, VideoEngagement>;
  favoriteModelIds: string[];
  isLoggedIn: boolean;
};

function ModelCard({
  model,
  engagement,
  favorited,
  isLoggedIn,
}: {
  model: Model;
  engagement: VideoEngagement;
  favorited: boolean;
  isLoggedIn: boolean;
}) {
  return (
    <div className="card-surface relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-accent-pink/60 hover:ring-2 hover:ring-accent-pink/30">
      <Link href={`/models/${model.id}`} className="flex flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-pink">
          {model.avatarUrl && (
            <img
              src={model.avatarUrl}
              alt={model.stageName}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          )}
          <LikePercentBadge engagement={engagement} className="absolute right-2 top-2 z-[1]" />
        </div>
        <div className="flex flex-1 flex-col justify-end p-3">
          <p className="text-sm font-semibold text-neutral-50 line-clamp-1">{model.stageName}</p>
          <p className="mt-1 text-[10px] text-neutral-400">
            {engagement.views > 0
              ? `${engagement.likePercent}% liked across scenes`
              : "No scene ratings yet"}
          </p>
        </div>
      </Link>
      {isLoggedIn && (
        <ModelFavoriteButton
          modelId={model.id}
          initialFavorited={favorited}
          compact
          className="absolute left-2 top-2 z-[2]"
        />
      )}
    </div>
  );
}

export function ModelsGridClient({
  models,
  engagementByModelId,
  favoriteModelIds,
  isLoggedIn,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return models;
    const q = query.toLowerCase();
    return models.filter((m) => m.stageName.toLowerCase().includes(q));
  }, [models, query]);

  const { female, male, other } = useMemo(() => {
    const female: Model[] = [];
    const male: Model[] = [];
    const other: Model[] = [];
    for (const m of filtered) {
      if (m.gender === "female") female.push(m);
      else if (m.gender === "male") male.push(m);
      else other.push(m);
    }
    return { female, male, other };
  }, [filtered]);

  function renderGrid(list: Model[]) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {list.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            engagement={engagementByModelId[model.id] ?? { likes: 0, views: 0, likePercent: 0 }}
            favorited={favoriteModelIds.includes(model.id)}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-neutral-400">
          Showing <span className="font-semibold text-neutral-200">{filtered.length}</span> of{" "}
          <span className="font-semibold text-neutral-200">{models.length}</span> models
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search models by name…"
          className="w-full max-w-xs rounded-lg border border-white/10 bg-black/60 px-4 py-2 text-sm outline-none ring-pink-400/30 focus:ring-2"
        />
      </div>

      {female.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-100">Female</h2>
          {renderGrid(female)}
        </section>
      )}

      {male.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-100">Male</h2>
          {renderGrid(male)}
        </section>
      )}

      {other.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-100">Other</h2>
          {renderGrid(other)}
        </section>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-xs text-neutral-500">No models match that search yet.</p>
      )}
    </div>
  );
}
