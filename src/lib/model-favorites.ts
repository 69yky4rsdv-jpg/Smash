import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getDataDir } from "./data";

type ModelFavoriteStore = {
  favoriteByUser: Record<string, string[]>;
};

const EMPTY_STORE: ModelFavoriteStore = {
  favoriteByUser: {},
};

function getStorePath(): string {
  return join(getDataDir(), "model-favorites.json");
}

function readStore(): ModelFavoriteStore {
  try {
    const path = getStorePath();
    if (!existsSync(path)) return { ...EMPTY_STORE };
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as ModelFavoriteStore;
    return { favoriteByUser: data.favoriteByUser ?? {} };
  } catch {
    return { ...EMPTY_STORE };
  }
}

function writeStore(store: ModelFavoriteStore): void {
  try {
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(getStorePath(), JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write model-favorites.json:", e);
  }
}

export function userHasFavoritedModel(userId: string, modelId: string): boolean {
  const favorites = readStore().favoriteByUser[userId] ?? [];
  return favorites.includes(modelId);
}

export function getUserFavoriteModelIds(userId: string): string[] {
  return readStore().favoriteByUser[userId] ?? [];
}

export function getModelFavoriteCount(modelId: string): number {
  const store = readStore();
  let count = 0;
  for (const ids of Object.values(store.favoriteByUser)) {
    if (ids.includes(modelId)) count += 1;
  }
  return count;
}

export function toggleModelFavorite(
  userId: string,
  modelId: string
): { favorited: boolean; favoriteCount: number } {
  const store = readStore();
  const favorites = store.favoriteByUser[userId] ?? [];
  const index = favorites.indexOf(modelId);

  if (index === -1) {
    store.favoriteByUser[userId] = [...favorites, modelId];
  } else {
    store.favoriteByUser[userId] = favorites.filter((id) => id !== modelId);
  }

  writeStore(store);

  return {
    favorited: index === -1,
    favoriteCount: getModelFavoriteCount(modelId),
  };
}
