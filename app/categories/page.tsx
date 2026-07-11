import { getCategories, getVideos } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { CategoriesClient } from "./CategoriesClient";
import { CategoriesAdmin } from "./CategoriesAdmin";

export default async function CategoriesPage() {
  const videos = getVideos();
  const categories = getCategories();
  const { isAdmin } = await getSession();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-neutral-300">
          Browse by category — most popular categories appear first. Click a card to see its videos.
        </p>
      </header>

      {isAdmin && <CategoriesAdmin categories={categories} />}

      <CategoriesClient categories={categories} videos={videos} />
    </div>
  );
}
