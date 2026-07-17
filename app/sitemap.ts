import type { MetadataRoute } from "next";
import { getCategories, getModels, getStoreVideos, getVideos } from "@/lib/data";
import { getSiteBaseUrl } from "@/lib/store-checkout";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteBaseUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/store`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/videos`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/models`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/support`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/2257`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Store product pages — the URLs you share on tubes/social and want indexed.
  const storePages: MetadataRoute.Sitemap = getStoreVideos().map((video) => ({
    url: `${base}/store/${video.id}`,
    lastModified: video.publishedAt ? new Date(video.publishedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const videoPages: MetadataRoute.Sitemap = getVideos()
    .filter((video) => !video.hidden)
    .map((video) => ({
      url: `${base}/videos/${video.id}`,
      lastModified: video.publishedAt ? new Date(video.publishedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const modelPages: MetadataRoute.Sitemap = getModels().map((model) => ({
    url: `${base}/models/${model.id}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const categoryPages: MetadataRoute.Sitemap = getCategories().map((category) => ({
    url: `${base}/categories/${category.id}`,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticPages, ...storePages, ...videoPages, ...modelPages, ...categoryPages];
}
