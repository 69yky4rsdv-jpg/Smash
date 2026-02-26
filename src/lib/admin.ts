import { categories, getVideos, models, saveVideos, subscriptionPlans, users, appendVideo } from "./data";
import type { Category, Model, Video } from "./types";
import { randomUUID } from "crypto";

export function createCategory(name: string): Category {
  const category: Category = {
    id: randomUUID(),
    name
  };
  categories.push(category);
  return category;
}

export function createModel(stageName: string, bio?: string, avatarUrl?: string, galleryUrls?: string[]): Model {
  const model: Model = {
    id: randomUUID(),
    stageName,
    bio,
    avatarUrl,
    galleryUrls,
    active: true
  };
  models.push(model);
  return model;
}

export function deleteModel(id: string): void {
  const index = models.findIndex((m) => m.id === id);
  if (index === -1) return;
  models.splice(index, 1);
  const videosList = getVideos(true);
  for (const video of videosList) {
    video.models = video.models.filter((modelId) => modelId !== id);
  }
  saveVideos(videosList);
}

export function toggleModelActive(id: string): Model | null {
  const model = models.find((m) => m.id === id);
  if (!model) return null;
  model.active = !model.active;
  return model;
}

export function updateModel(
  id: string,
  updates: Partial<Pick<Model, "stageName" | "bio" | "avatarUrl" | "galleryUrls" | "active">>
): Model | null {
  const model = models.find((m) => m.id === id);
  if (!model) return null;
  if (updates.stageName !== undefined) model.stageName = updates.stageName;
  if (updates.bio !== undefined) model.bio = updates.bio;
  if (updates.avatarUrl !== undefined) model.avatarUrl = updates.avatarUrl;
  if (updates.galleryUrls !== undefined) model.galleryUrls = updates.galleryUrls;
  if (updates.active !== undefined) model.active = updates.active;
  return model;
}

export function createVideo(input: {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  categoryIds: string[];
  modelIds: string[];
}): Video {
  const video: Video = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    thumbnailUrl: input.thumbnailUrl,
    videoUrl: input.videoUrl,
    publishedAt: new Date().toISOString(),
    categories: input.categoryIds,
    models: input.modelIds,
    isTrending: false
  };
  appendVideo(video);
  return video;
}

export function setUserSubscription(userId: string, planId: string | undefined) {
  const user = users.find((u) => u.id === userId);
  if (!user) return;
  if (planId && !subscriptionPlans.find((p) => p.id === planId)) {
    return;
  }
  user.subscriptionPlanId = planId;
}

