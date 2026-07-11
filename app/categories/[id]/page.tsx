import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getVideos } from "@/lib/data";
import { CategoryVideosClient } from "./CategoryVideosClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const category = getCategories().find((cat) => cat.id === id);
  if (!category) notFound();

  const videos = getVideos()
    .filter((v) => v.categories?.includes(id))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <header className="space-y-3">
        <Link
          href="/categories"
          className="inline-flex text-xs text-neutral-400 transition hover:text-accent-pinkSoft"
        >
          ← All categories
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{category.name}</h1>
          <p className="text-sm text-neutral-300">
            {videos.length} {videos.length === 1 ? "video" : "videos"} in this category
          </p>
        </div>
      </header>

      <CategoryVideosClient videos={videos} categoryName={category.name} />
    </div>
  );
}
