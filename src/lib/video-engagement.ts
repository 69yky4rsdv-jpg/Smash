import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getDataDir } from "./data";

type VideoStats = {
  likes: number;
  views: number;
};

type VideoEngagementStore = {
  stats: Record<string, VideoStats>;
  likedByUser: Record<string, string[]>;
  viewedByUser: Record<string, string[]>;
};

const EMPTY_STORE: VideoEngagementStore = {
  stats: {},
  likedByUser: {},
  viewedByUser: {},
};

function getStorePath(): string {
  return join(getDataDir(), "video-engagement.json");
}

function readStore(): VideoEngagementStore {
  try {
    const path = getStorePath();
    if (!existsSync(path)) return { ...EMPTY_STORE };
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as VideoEngagementStore;
    return {
      stats: data.stats ?? {},
      likedByUser: data.likedByUser ?? {},
      viewedByUser: data.viewedByUser ?? {},
    };
  } catch {
    return { ...EMPTY_STORE };
  }
}

function writeStore(store: VideoEngagementStore): void {
  try {
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(getStorePath(), JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write video-engagement.json:", e);
  }
}

function getStats(store: VideoEngagementStore, videoId: string): VideoStats {
  return store.stats[videoId] ?? { likes: 0, views: 0 };
}

export function calcLikePercent(likes: number, views: number): number {
  if (views <= 0) return 0;
  return Math.min(100, Math.round((likes / views) * 100));
}

export type VideoEngagement = {
  likes: number;
  views: number;
  likePercent: number;
};

export function getVideoEngagement(videoId: string): VideoEngagement {
  const stats = getStats(readStore(), videoId);
  return {
    likes: stats.likes,
    views: stats.views,
    likePercent: calcLikePercent(stats.likes, stats.views),
  };
}

export function getEngagementForVideos(videoIds: string[]): Record<string, VideoEngagement> {
  const store = readStore();
  const result: Record<string, VideoEngagement> = {};
  for (const id of videoIds) {
    const stats = getStats(store, id);
    result[id] = {
      likes: stats.likes,
      views: stats.views,
      likePercent: calcLikePercent(stats.likes, stats.views),
    };
  }
  return result;
}

/** Aggregate likes/views across all videos a model appears in. */
export function getEngagementForModels(
  modelIds: string[],
  videos: { id: string; models: string[] }[]
): Record<string, VideoEngagement> {
  const store = readStore();
  const result: Record<string, VideoEngagement> = {};

  for (const modelId of modelIds) {
    let likes = 0;
    let views = 0;
    for (const video of videos) {
      if (!video.models.includes(modelId)) continue;
      const stats = getStats(store, video.id);
      likes += stats.likes;
      views += stats.views;
    }
    result[modelId] = {
      likes,
      views,
      likePercent: calcLikePercent(likes, views),
    };
  }

  return result;
}

export function userHasLikedVideo(userId: string, videoId: string): boolean {
  const liked = readStore().likedByUser[userId] ?? [];
  return liked.includes(videoId);
}

export function getUserLikedVideoIds(userId: string): string[] {
  return readStore().likedByUser[userId] ?? [];
}

export function recordVideoView(userId: string, videoId: string): VideoEngagement {
  const store = readStore();
  const viewed = store.viewedByUser[userId] ?? [];
  if (viewed.includes(videoId)) {
    const stats = getStats(store, videoId);
    return {
      likes: stats.likes,
      views: stats.views,
      likePercent: calcLikePercent(stats.likes, stats.views),
    };
  }

  store.viewedByUser[userId] = [...viewed, videoId];
  const stats = getStats(store, videoId);
  stats.views += 1;
  store.stats[videoId] = stats;
  writeStore(store);

  return {
    likes: stats.likes,
    views: stats.views,
    likePercent: calcLikePercent(stats.likes, stats.views),
  };
}

export function toggleVideoLike(
  userId: string,
  videoId: string
): { liked: boolean; engagement: VideoEngagement } {
  const store = readStore();
  const liked = store.likedByUser[userId] ?? [];
  const index = liked.indexOf(videoId);
  const stats = getStats(store, videoId);

  if (index === -1) {
    store.likedByUser[userId] = [...liked, videoId];
    stats.likes += 1;
  } else {
    store.likedByUser[userId] = liked.filter((id) => id !== videoId);
    stats.likes = Math.max(0, stats.likes - 1);
  }

  store.stats[videoId] = stats;
  writeStore(store);

  return {
    liked: index === -1,
    engagement: {
      likes: stats.likes,
      views: stats.views,
      likePercent: calcLikePercent(stats.likes, stats.views),
    },
  };
}
