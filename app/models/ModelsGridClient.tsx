"use client";

import type { Model } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  models: Model[];
};

function ModelCard({ model }: { model: Model }) {
  return (
    <Link
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
  );
}

export function ModelsGridClient({ models }: Props) {
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
          className="w-full max-w-xs rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
        />
      </div>

      {female.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-100">Female</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {female.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </section>
      )}

      {male.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-100">Male</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {male.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </section>
      )}

      {other.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-100">Other</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {other.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-xs text-neutral-500">
          No models match that search yet.
        </p>
      )}
    </div>
  );
}

