import type { Category, Video } from "@/lib/types";

export type CategoryWithMeta = Category & {
  videoCount: number;
  coverUrl?: string;
};

function getCategoryCoverUrl(categoryVideos: Video[]): string | undefined {
  const withThumbnail = categoryVideos
    .filter((v) => v.thumbnailUrl)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return withThumbnail[0]?.thumbnailUrl;
}

export function getCategoriesWithMeta(categories: Category[], videos: Video[]): CategoryWithMeta[] {
  const list: CategoryWithMeta[] = categories.map((cat) => {
    const categoryVideos = videos.filter((v) => v.categories?.includes(cat.id));
    return {
      ...cat,
      videoCount: categoryVideos.length,
      coverUrl: getCategoryCoverUrl(categoryVideos),
    };
  });

  return list.sort((a, b) => {
    if (b.videoCount !== a.videoCount) return b.videoCount - a.videoCount;
    return a.name.localeCompare(b.name);
  });
}
