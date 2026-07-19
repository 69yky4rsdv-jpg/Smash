"use client";

import { useMemo, useState } from "react";

type Item = {
  id: string;
  label: string;
};

type Props = {
  name: string;
  label: string;
  items: Item[];
  /** Pre-select these IDs (e.g. when editing a video). */
  selectedIds?: string[];
};

export function TagMultiSelect({ name, label, items, selectedIds = [] }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(() =>
    selectedIds.filter((id) => items.some((item) => item.id === id))
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-1 text-xs">
      {selected.map((id) => (
        <input key={`${name}-${id}`} type="hidden" name={name} value={id} />
      ))}
      <div className="flex items-center justify-between gap-2">
        <p className="text-neutral-200">
          {label}
          {selected.length > 0 ? (
            <span className="ml-1 text-neutral-500">({selected.length})</span>
          ) : null}
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-32 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[11px] outline-none ring-pink-400/30 focus:ring-2"
        />
      </div>
      <div className="mt-1 flex max-h-24 flex-wrap gap-2 overflow-y-auto text-[11px]">
        {filtered.map((item) => (
          <label key={item.id} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => toggle(item.id)}
              className="h-3 w-3 rounded border-white/20 bg-black/70"
            />
            <span>{item.label}</span>
          </label>
        ))}
        {filtered.length === 0 && (
          <span className="text-[11px] text-neutral-500">No matches found.</span>
        )}
      </div>
    </div>
  );
}
