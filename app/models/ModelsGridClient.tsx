"use client";

import type { Model } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  models: Model[];
};

export function ModelsGridClient({ models }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return models;
    const q = query.toLowerCase();
    return models.filter((m) => m.stageName.toLowerCase().includes(q));
  }, [models, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-neutral-400">
          Showing <span className="font-semibold text-neutral-200">{filtered.length}</span> of{" "}
          <span className="font-semibold text-neutral-200">{models.length}</span> models
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search models by name…"
          className="w-full max-w-xs rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((model) => (
          <Link
            key={model.id}
            href={`/models/${model.id}`}
            className="card-surface flex flex-col items-center gap-3 p-4 transition hover:ring-2 hover:ring-accent-pink/40"
          >
            <div className="h-20 w-20 overflow-hidden rounded-full bg-gradient-pink">
              {model.avatarUrl && (
                <img
                  src={model.avatarUrl}
                  alt={model.stageName}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-neutral-50">{model.stageName}</p>
              <p className="text-[11px] text-neutral-400">
                {model.active ? "Active" : "Taking a break"}
              </p>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-xs text-neutral-500">
            No models match that search yet.
          </p>
        )}
      </div>
    </div>
  );
}

