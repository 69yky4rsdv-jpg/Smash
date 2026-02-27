import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { Category, Model, SubscriptionPlan, User, Video } from "./types";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "yearly",
    name: "12 Month Membership",
    pricePerMonth: 10.16,
    billingLabel: "Billed once at $121.99",
    highlight: true,
    checkoutUrl: "https://buy.stripe.com/9B63cxc2p09qdDU8XTgjC07"
  },
  {
    id: "6month",
    name: "6 Month Membership",
    pricePerMonth: 15.99,
    billingLabel: "Billed every 6 months at $95.94",
    checkoutUrl: "https://buy.stripe.com/cNicN71nL6xO57o1vrgjC06"
  },
  {
    id: "monthly",
    name: "30 Day Membership",
    pricePerMonth: 33.99,
    billingLabel: "Billed monthly at $33.99",
    checkoutUrl: "https://buy.stripe.com/5kQ00l3vT5tKbvM1vrgjC05"
  },
  {
    id: "weekly",
    name: "7 Day Trial",
    pricePerMonth: 7,
    billingLabel: "First week just $7.00",
    checkoutUrl: "https://buy.stripe.com/dRmfZj2rPf4kgQ63DzgjC04"
  }
];

export const categories: Category[] = [
  { id: "featured", name: "Featured" },
  { id: "trending", name: "Trending" },
  { id: "new", name: "Latest Releases" },
  { id: "cosplay", name: "Cosplay" },
  { id: "threesome", name: "Threesome" }
];

const DEFAULT_MODELS: Model[] = [
  {
    id: "model-1",
    stageName: "Anissa",
    active: true
  },
  {
    id: "model-2",
    stageName: "Haley",
    active: true
  },
  {
    id: "model-3",
    stageName: "Alanna",
    active: true
  }
];

function getModelsPath(): string {
  return join(process.cwd(), "data", "models.json");
}

export function getModels(): Model[] {
  try {
    const path = getModelsPath();
    if (!existsSync(path)) return [...DEFAULT_MODELS];
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as Model[];
    return Array.isArray(data) ? data : [...DEFAULT_MODELS];
  } catch {
    return [...DEFAULT_MODELS];
  }
}

export function saveModels(modelsList: Model[]): void {
  try {
    const dir = join(process.cwd(), "data");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(getModelsPath(), JSON.stringify(modelsList, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write models.json:", e);
  }
}

const DEFAULT_VIDEOS: Video[] = [
  {
    id: "video-1",
    title: "Backdoor Action In Pink",
    description: "A high-energy scene inspired by your reference layout.",
    thumbnailUrl: "/thumbnails/video-1.jpg",
    videoUrl: "/videos/video-1.mp4",
    publishedAt: "2026-02-17",
    categories: ["featured", "new"],
    models: ["model-1"],
    isTrending: true
  },
  {
    id: "video-2",
    title: "Slutty Cheerleader Academy",
    description: "Cheer-themed fantasy in cinematic 4K.",
    thumbnailUrl: "/thumbnails/video-2.jpg",
    videoUrl: "/videos/video-2.mp4",
    publishedAt: "2026-02-17",
    categories: ["featured", "trending"],
    models: ["model-2"],
    isTrending: true
  },
  {
    id: "video-3",
    title: "Alanna vs. Ricky",
    description: "A sensual, slow-burn scene for late nights.",
    thumbnailUrl: "/thumbnails/video-3.jpg",
    videoUrl: "/videos/video-3.mp4",
    publishedAt: "2025-08-25",
    categories: ["trending"],
    models: ["model-3"],
    isTrending: true
  }
];

function getVideosPath(): string {
  return join(process.cwd(), "data", "videos.json");
}

/** Reads videos from disk. Set includeHidden=true (e.g. in admin) to include hidden videos. */
export function getVideos(includeHidden = false): Video[] {
  try {
    const path = getVideosPath();
    if (!existsSync(path)) return [...DEFAULT_VIDEOS];
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as Video[];
    const list = Array.isArray(data) ? data : [...DEFAULT_VIDEOS];
    if (includeHidden) return list;
    return list.filter((v) => !v.hidden);
  } catch {
    return [...DEFAULT_VIDEOS];
  }
}

/** Appends a video and saves to disk. */
export function appendVideo(video: Video): void {
  const list = getVideos(true);
  list.push(video);
  try {
    const dir = join(process.cwd(), "data");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(getVideosPath(), JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write videos.json:", e);
  }
}

/** Saves the full videos array (e.g. after removing a model from some). */
export function saveVideos(videosList: Video[]): void {
  try {
    const dir = join(process.cwd(), "data");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(getVideosPath(), JSON.stringify(videosList, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write videos.json:", e);
  }
}

/** Toggle hidden flag for a video. Pass includeHidden=true when reading to get all. */
export function setVideoHidden(id: string, hidden: boolean): void {
  const list = getVideos(true);
  const video = list.find((v) => v.id === id);
  if (!video) return;
  video.hidden = hidden;
  saveVideos(list);
}

/** Permanently remove a video from the list. */
export function deleteVideo(id: string): void {
  const list = getVideos(true).filter((v) => v.id !== id);
  saveVideos(list);
}

/** Update an existing video's fields. */
export function updateVideo(
  id: string,
  updates: Partial<
    Pick<
      Video,
      "title" | "description" | "thumbnailUrl" | "videoUrl" | "categories" | "models" | "isTrending" | "publishedAt"
    >
  >
): void {
  const list = getVideos(true);
  const video = list.find((v) => v.id === id);
  if (!video) return;
  if (updates.title !== undefined) video.title = updates.title;
  if (updates.description !== undefined) video.description = updates.description;
  if (updates.thumbnailUrl !== undefined) video.thumbnailUrl = updates.thumbnailUrl;
  if (updates.videoUrl !== undefined) video.videoUrl = updates.videoUrl;
  if (updates.categories !== undefined) video.categories = updates.categories;
  if (updates.models !== undefined) video.models = updates.models;
  if (updates.isTrending !== undefined) video.isTrending = updates.isTrending;
   if (updates.publishedAt !== undefined) video.publishedAt = updates.publishedAt;
  saveVideos(list);
}

// Simple in-memory user store for demo purposes only.
// In a real deployment this should be replaced with a database.
export const users: User[] = [
  {
    id: "admin",
    email: "admin@velvetstream.test",
    password: "admin",
    role: "admin",
    subscriptionPlanId: "yearly"
  }
];

