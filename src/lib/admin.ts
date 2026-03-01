import { getCategories, saveCategories, getModels, getVideos, saveModels, saveVideos, subscriptionPlans, getUsers, saveUsers, appendVideo } from "./data";
import type { Category, Model, SubscriptionPlan, Video } from "./types";
import { inferModelGender } from "./model-gender";
import { randomUUID } from "crypto";

export function createCategory(name: string): Category {
  const list = getCategories();
  const category: Category = {
    id: randomUUID(),
    name
  };
  list.push(category);
  saveCategories(list);
  return category;
}

/** Get existing category by name (case-insensitive) or create one. */
export function getOrCreateCategory(name: string): Category {
  const list = getCategories();
  const n = name.trim();
  const existing = list.find((c) => c.name.toLowerCase() === n.toLowerCase());
  if (existing) return existing;
  return createCategory(n);
}

export function createModel(
  stageName: string,
  bio?: string,
  avatarUrl?: string,
  galleryUrls?: string[],
  gender?: Model["gender"]
): Model {
  const list = getModels();
  const model: Model = {
    id: randomUUID(),
    stageName,
    bio,
    avatarUrl,
    galleryUrls,
    active: true,
    gender
  };
  list.push(model);
  saveModels(list);
  return model;
}

/** Get existing model by stage name (case-insensitive) or create one. */
export function getOrCreateModel(stageName: string): Model {
  const list = getModels();
  const n = stageName.trim();
  const existing = list.find((m) => m.stageName.toLowerCase() === n.toLowerCase());
  if (existing) return existing;
  return createModel(n);
}

export function deleteModel(id: string): void {
  const list = getModels();
  const index = list.findIndex((m) => m.id === id);
  if (index === -1) return;
  list.splice(index, 1);
  saveModels(list);
  const videosList = getVideos(true);
  for (const video of videosList) {
    video.models = video.models.filter((modelId) => modelId !== id);
  }
  saveVideos(videosList);
}

export function toggleModelActive(id: string): Model | null {
  const list = getModels();
  const model = list.find((m) => m.id === id);
  if (!model) return null;
  model.active = !model.active;
  saveModels(list);
  return model;
}

export function updateModel(
  id: string,
  updates: Partial<Pick<Model, "stageName" | "bio" | "avatarUrl" | "galleryUrls" | "active" | "gender">>
): Model | null {
  const list = getModels();
  const model = list.find((m) => m.id === id);
  if (!model) return null;
  if (updates.stageName !== undefined) model.stageName = updates.stageName;
  if (updates.bio !== undefined) model.bio = updates.bio;
  if (updates.avatarUrl !== undefined) model.avatarUrl = updates.avatarUrl;
  if (updates.galleryUrls !== undefined) model.galleryUrls = updates.galleryUrls;
  if (updates.active !== undefined) model.active = updates.active;
  if (updates.gender !== undefined) model.gender = updates.gender;
  saveModels(list);
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
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return;
  if (planId && !subscriptionPlans.find((p) => p.id === planId)) {
    return;
  }
  user.subscriptionPlanId = planId;
  saveUsers(users);
}

/**
 * Set gender on all models that don't have it, using name-based inference (male name list).
 * Returns how many models were updated.
 */
export function autoCategorizeModelGenders(): { updated: number } {
  const models = getModels();
  let updated = 0;
  for (const model of models) {
    if (model.gender != null) continue;
    const inferred = inferModelGender(model.stageName);
    updateModel(model.id, { gender: inferred });
    updated++;
  }
  return { updated };
}

export function updateSubscriptionPlan(
  id: string,
  updates: Partial<Pick<SubscriptionPlan, "pricePerMonth" | "billingLabel">>
): SubscriptionPlan | null {
  const plan = subscriptionPlans.find((p) => p.id === id);
  if (!plan) return null;
  if (updates.pricePerMonth !== undefined) plan.pricePerMonth = updates.pricePerMonth;
  if (updates.billingLabel !== undefined) plan.billingLabel = updates.billingLabel;
  return plan;
}

