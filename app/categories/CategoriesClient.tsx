"use client";

import type { Category, Video } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getCategoriesWithMeta, type CategoryWithMeta } from "@/lib/category-display";

type Props = {
  categories: Category[];
  videos: Video[];
};

function CategoryCard({ category }: { category: CategoryWithMeta }) {
  return (
    <Link
      href={`/categories/${category.id}`}
      className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 text-left transition hover:border-accent-pink/40 hover:ring-2 hover:ring-accent-pink/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/60"
    >
      {category.coverUrl ? (
        <img
          src={category.coverUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/30 via-black to-pink-700/50" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-base font-semibold leading-tight text-white drop-shadow-sm sm:text-lg">
          {category.name}
        </p>
        <p className="mt-1 text-[11px] text-neutral-300">
          {category.videoCount} {category.videoCount === 1 ? "video" : "videos"}
        </p>
      </div>
    </Link>
  );
}

export function CategoriesClient({ categories, videos }: Props) {
  const [categorySearch, setCategorySearch] = useState("");

  const categoriesWithMeta = useMemo(
    () => getCategoriesWithMeta(categories, videos),
    [categories, videos]
  );

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categoriesWithMeta;
    const q = categorySearch.toLowerCase();
    return categoriesWithMeta.filter((cat) => cat.name.toLowerCase().includes(q));
  }, [categoriesWithMeta, categorySearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-400">
          {filteredCategories.length} categories · sorted by popularity
        </p>
        <input
          type="search"
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          placeholder="Search categories…"
          className="w-full max-w-xs rounded-lg border border-white/10 bg-black/60 px-4 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredCategories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
        {filteredCategories.length === 0 && (
          <p className="col-span-full text-sm text-neutral-500">No categories match that search.</p>
        )}
      </div>
    </div>
  );
}
