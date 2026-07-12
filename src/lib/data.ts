import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { Category, Model, SubscriptionPlan, User, Video } from "./types";

/** Data directory: DATA_DIR env, or project root /data. Ensures we use the real data files. */
export function getDataDir(): string {
  const env = process.env.DATA_DIR;
  if (env && env.trim()) {
    return resolve(process.cwd(), env.trim());
  }
  return join(process.cwd(), "data");
}

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
    checkoutUrl: "https://buy.stripe.com/4gMfZj6I51du2Zgb61gjC08"
  },
  {
    id: "weekly",
    name: "7 Day Trial",
    pricePerMonth: 7,
    billingLabel: "First week just $7.00",
    checkoutUrl: "https://buy.stripe.com/dRmfZj2rPf4kgQ63DzgjC04"
  }
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: "featured", name: "Featured" },
  { id: "trending", name: "Trending" },
  { id: "new", name: "Latest Releases" },
  { id: "cosplay", name: "Cosplay" },
  { id: "threesome", name: "Threesome" }
];

function getCategoriesPath(): string {
  return join(getDataDir(), "categories.json");
}

export function getCategories(): Category[] {
  try {
    const path = getCategoriesPath();
    if (!existsSync(path)) return [...DEFAULT_CATEGORIES];
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as Category[];
    return Array.isArray(data) ? data : [...DEFAULT_CATEGORIES];
  } catch {
    return [...DEFAULT_CATEGORIES];
  }
}

export function saveCategories(categoriesList: Category[]): void {
  try {
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(getCategoriesPath(), JSON.stringify(categoriesList, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write categories.json:", e);
  }
}

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
  return join(getDataDir(), "models.json");
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
    const dir = getDataDir();
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
  return join(getDataDir(), "videos.json");
}

function getStoreVideosPath(): string {
  return join(getDataDir(), "store-videos.json");
}

/** Reads videos from disk. Set includeHidden=true (e.g. in admin) to include hidden videos. */
export function getVideos(includeHidden = false): Video[] {
  try {
    const path = getVideosPath();
    if (!existsSync(path)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[data] videos.json not found at", path, "- using default videos. Set DATA_DIR if your data folder is elsewhere.");
      }
      return [...DEFAULT_VIDEOS];
    }
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as Video[];
    const list = Array.isArray(data) ? data : [...DEFAULT_VIDEOS];
    if (includeHidden) return list;
    return list.filter((v) => !v.hidden);
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[data] Failed to read videos.json:", e);
    }
    return [...DEFAULT_VIDEOS];
  }
}

/** Appends a video and saves to disk. */
export function appendVideo(video: Video): void {
  const list = getVideos(true);
  list.push(video);
  try {
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(getVideosPath(), JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write videos.json:", e);
  }
}

/** Saves the full videos array (e.g. after removing a model from some). */
export function saveVideos(videosList: Video[]): void {
  try {
    const dir = getDataDir();
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
      | "title"
      | "description"
      | "thumbnailUrl"
      | "videoUrl"
      | "previewUrl"
      | "categories"
      | "models"
      | "isTrending"
      | "publishedAt"
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
  if (updates.previewUrl !== undefined) video.previewUrl = updates.previewUrl;
  if (updates.categories !== undefined) video.categories = updates.categories;
  if (updates.models !== undefined) video.models = updates.models;
  if (updates.isTrending !== undefined) video.isTrending = updates.isTrending;
   if (updates.publishedAt !== undefined) video.publishedAt = updates.publishedAt;
  saveVideos(list);
}

/** Reads store videos from disk (separate from main videos). */
export function getStoreVideos(): Video[] {
  try {
    const path = getStoreVideosPath();
    if (!existsSync(path)) return [];
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as Video[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveStoreVideos(videosList: Video[]): void {
  try {
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(getStoreVideosPath(), JSON.stringify(videosList, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write store-videos.json:", e);
  }
}

export function appendStoreVideo(video: Video): void {
  const list = getStoreVideos();
  list.push(video);
  saveStoreVideos(list);
}

export function updateStoreVideo(
  id: string,
  updates: Partial<
    Pick<
      Video,
      | "title"
      | "description"
      | "thumbnailUrl"
      | "videoUrl"
      | "previewUrl"
      | "purchaseCheckoutUrl"
      | "previewDurationSeconds"
      | "storePrice"
      | "storeDurationLabel"
      | "storeFeaturing"
      | "storeExclusive"
      | "publishedAt"
      | "categories"
      | "models"
    >
  >
): void {
  const list = getStoreVideos();
  const video = list.find((v) => v.id === id);
  if (!video) return;
  if (updates.title !== undefined) video.title = updates.title;
  if (updates.description !== undefined) video.description = updates.description || undefined;
  if (updates.thumbnailUrl !== undefined) {
    video.thumbnailUrl = updates.thumbnailUrl.trim() ? updates.thumbnailUrl.trim() : undefined;
  }
  if (updates.videoUrl !== undefined) video.videoUrl = updates.videoUrl.trim();
  if (updates.previewUrl !== undefined) {
    video.previewUrl = updates.previewUrl.trim() ? updates.previewUrl.trim() : undefined;
  }
  if (updates.purchaseCheckoutUrl !== undefined) {
    video.purchaseCheckoutUrl = updates.purchaseCheckoutUrl.trim()
      ? updates.purchaseCheckoutUrl.trim()
      : undefined;
  }
  if (updates.previewDurationSeconds !== undefined) {
    video.previewDurationSeconds =
      updates.previewDurationSeconds === 0 ? 0 : updates.previewDurationSeconds || undefined;
  }
  if (updates.storePrice !== undefined) {
    video.storePrice =
      typeof updates.storePrice === "number" && updates.storePrice > 0
        ? updates.storePrice
        : undefined;
  }
  if (updates.storeDurationLabel !== undefined) {
    video.storeDurationLabel = updates.storeDurationLabel.trim()
      ? updates.storeDurationLabel.trim()
      : undefined;
  }
  if (updates.storeFeaturing !== undefined) {
    video.storeFeaturing = updates.storeFeaturing.trim() ? updates.storeFeaturing.trim() : undefined;
  }
  if (updates.storeExclusive !== undefined) {
    video.storeExclusive = updates.storeExclusive;
  }
  if (updates.publishedAt !== undefined) video.publishedAt = updates.publishedAt;
  if (updates.categories !== undefined) video.categories = updates.categories;
  if (updates.models !== undefined) video.models = updates.models;
  saveStoreVideos(list);
}

export function recordStoreVideoPurchase(userId: string, storeVideoId: string): void {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return;
  const existing = user.purchasedStoreVideoIds ?? [];
  if (existing.includes(storeVideoId)) return;
  user.purchasedStoreVideoIds = [...existing, storeVideoId];
  saveUsers(users);
}

export function userHasPurchasedStoreVideo(
  userId: string | undefined,
  storeVideoId: string,
  isAdmin = false
): boolean {
  if (isAdmin) return true;
  if (!userId) return false;
  const user = getUsers().find((u) => u.id === userId);
  return user?.purchasedStoreVideoIds?.includes(storeVideoId) ?? false;
}

export function deleteStoreVideo(id: string): void {
  const list = getStoreVideos().filter((v) => v.id !== id);
  saveStoreVideos(list);
}

/** Video photo galleries: videoId -> array of image URLs */
function getVideoPhotosPath(): string {
  return join(getDataDir(), "video-photos.json");
}

function readVideoPhotosMap(): Record<string, string[]> {
  try {
    const path = getVideoPhotosPath();
    if (!existsSync(path)) return {};
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as Record<string, string[]>;
    if (data && typeof data === "object") return data;
    return {};
  } catch {
    return {};
  }
}

export function getVideoPhotoUrls(videoId: string): string[] {
  const map = readVideoPhotosMap();
  const urls = map[videoId];
  return Array.isArray(urls) ? urls : [];
}

export function setVideoPhotos(videoId: string, urls: string[]): void {
  const map = readVideoPhotosMap();
  map[videoId] = urls;
  try {
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(getVideoPhotosPath(), JSON.stringify(map, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write video-photos.json:", e);
  }
}

export function addVideoPhotos(videoId: string, urls: string[]): void {
  const existing = getVideoPhotoUrls(videoId);
  const combined = [...existing];
  for (const url of urls) {
    const u = url.trim();
    if (u && !combined.includes(u)) combined.push(u);
  }
  setVideoPhotos(videoId, combined);
}

/** Grid page: which photo ids are shown + custom photos. */
const MAX_GRID_PHOTOS = 30;

function getGridPhotosPath(): string {
  return join(getDataDir(), "grid-photos.json");
}

type GridPhotosFile = { photoIds?: string[]; customPhotos?: { id: string; url: string }[] };

function readGridPhotosFile(): GridPhotosFile {
  try {
    const path = getGridPhotosPath();
    if (!existsSync(path)) return {};
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as GridPhotosFile;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function writeGridPhotosFile(data: GridPhotosFile): void {
  try {
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(getGridPhotosPath(), JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write grid-photos.json:", e);
  }
}

export function getGridPhotoIds(): string[] {
  const data = readGridPhotosFile();
  const raw = Array.isArray(data.photoIds) ? data.photoIds : [];
  const seen = new Set<string>();
  return raw.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function setGridPhotoIds(photoIds: string[]): void {
  const data = readGridPhotosFile();
  const seen = new Set<string>();
  const deduped = photoIds.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  writeGridPhotosFile({ ...data, photoIds: deduped.slice(0, MAX_GRID_PHOTOS) });
}

export type GridPhoto = { id: string; url: string; videoId: string };

/** All photos that can be shown on the grid: video thumbnails + gallery photos + custom photos. */
export function getGridPhotos(): GridPhoto[] {
  const videos = getVideos(true).filter((v) => v.thumbnailUrl || getVideoPhotoUrls(v.id).length > 0);
  const out: GridPhoto[] = [];
  for (const v of videos) {
    const gallery = getVideoPhotoUrls(v.id);
    if (gallery.length) {
      gallery.forEach((url, i) => out.push({ id: `${v.id}-${i}`, url, videoId: v.id }));
    } else if (v.thumbnailUrl) {
      out.push({ id: v.id, url: v.thumbnailUrl, videoId: v.id });
    }
  }
  const data = readGridPhotosFile();
  const custom = Array.isArray(data.customPhotos) ? data.customPhotos : [];
  for (const cp of custom) {
    if (cp?.id && cp?.url) out.push({ id: cp.id, url: cp.url, videoId: "" });
  }
  return out;
}

/** Remove a custom grid photo entirely (from customPhotos and photoIds). Video-based photos are left intact. */
export function removeGridPhoto(photoId: string): void {
  const data = readGridPhotosFile();
  const custom = Array.isArray(data.customPhotos) ? data.customPhotos : [];
  const photoIds = Array.isArray(data.photoIds) ? data.photoIds : [];
  const nextCustom = custom.filter((cp) => cp?.id !== photoId);
  const nextPhotoIds = photoIds.filter((id) => id !== photoId);
  writeGridPhotosFile({
    ...data,
    customPhotos: nextCustom,
    photoIds: nextPhotoIds
  });
}

/** Add custom photo URLs to the grid (and to selected ids). Ids are generated as custom-0, custom-1, ... Max 30 photos total. Returns the new photos so the client can show them immediately. */
export function addGridCustomPhotos(urls: string[]): GridPhoto[] {
  const data = readGridPhotosFile();
  const custom = Array.isArray(data.customPhotos) ? data.customPhotos : [];
  const photoIds = Array.isArray(data.photoIds) ? data.photoIds : [];
  const nextIndex = custom.length;
  // URLs coming in here are already normalized by parsePhotoUrls; just trim and keep as-is.
  const fullUrls = urls.map((u) => u.trim()).filter(Boolean);
  const room = Math.max(0, MAX_GRID_PHOTOS - photoIds.length);
  const toAdd = fullUrls.slice(0, room);
  const newCustom = toAdd.map((url, i) => ({
    id: `custom-${nextIndex + i}`,
    url
  }));
  const newIds = newCustom.map((c) => c.id);
  writeGridPhotosFile({
    photoIds: [...photoIds, ...newIds],
    customPhotos: [...custom, ...newCustom]
  });
  return newCustom.map((c) => ({ id: c.id, url: c.url, videoId: "" }));
}

/** Pending signups (email collected on start page before account creation). */
function getPendingSignupsPath(): string {
  return join(getDataDir(), "pending-signups.json");
}

export type PendingSignup = { email: string; createdAt: string };

export function getPendingSignups(): PendingSignup[] {
  const path = getPendingSignupsPath();
  if (!existsSync(path)) return [];
  try {
    const raw = readFileSync(path, "utf-8");
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** True if email is already in pending signups or registered users (case-insensitive). */
export function isEmailAlreadyUsed(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  const pending = getPendingSignups();
  if (pending.some((e) => e.email.toLowerCase() === normalized)) return true;
  const users = getUsers();
  return users.some((u) => u.email?.toLowerCase() === normalized);
}

export function addPendingSignupEmail(email: string): void {
  const path = getPendingSignupsPath();
  const dir = getDataDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  let list = getPendingSignups();
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  if (list.some((e) => e.email.toLowerCase() === normalized)) return; // skip duplicate
  list.push({ email: normalized, createdAt: new Date().toISOString() });
  try {
    writeFileSync(path, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write pending-signups.json:", e);
  }
}

/** Parse pasted URLs (newline or comma separated); normalize short form (cdn.net/...) to full Bunny URL. */
export function parsePhotoUrls(paste: string): string[] {
  const raw = paste.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean);
  return raw.map((u) =>
    u.startsWith("http://") || u.startsWith("https://")
      ? u
      : `https://Pull-Video-Load.b-cdn.net${u.startsWith("/") ? "" : "/"}${u}`
  );
}

const DEFAULT_USERS: User[] = [
  {
    id: "admin",
    email: "admin@velvetstream.test",
    password: "admin",
    role: "admin",
    subscriptionPlanId: "yearly"
  }
];

function getUsersPath(): string {
  return join(getDataDir(), "users.json");
}

export function getUsers(): User[] {
  try {
    const path = getUsersPath();
    if (!existsSync(path)) return [...DEFAULT_USERS];
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as User[];
    if (!Array.isArray(data)) return [...DEFAULT_USERS];

    // Always ensure the default admin user exists, even when users.json is present.
    const hasAdmin = data.some((u) => u.id === "admin" || u.email === "admin@velvetstream.test");
    return hasAdmin ? data : [...data, ...DEFAULT_USERS];
  } catch {
    return [...DEFAULT_USERS];
  }
}

export function saveUsers(usersList: User[]): void {
  try {
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(getUsersPath(), JSON.stringify(usersList, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write users.json:", e);
  }
}

