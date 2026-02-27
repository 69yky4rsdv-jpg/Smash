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
      {/* Card layout that shows ALL models passed in (no slicing). */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((model) => (
          <Link
            key={model.id}
            href={`/models/${model.id}`}
            className="card-surface flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-accent-pink/60 hover:ring-2 hover:ring-accent-pink/30"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-pink">
              {model.avatarUrl && (
                <img
                  src={model.avatarUrl}
                  alt={model.stageName}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between p-3">
              <div>
                <p className="text-sm font-semibold text-neutral-50 line-clamp-1">
                  {model.stageName}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                    model.active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-neutral-700/40 text-neutral-300"
                  }`}
                >
                  {model.active ? "Active" : "Taking a break"}
                </span>
              </div>
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

