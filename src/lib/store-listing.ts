import type { Video } from "./types";

export function isStoreExclusive(video: Pick<Video, "storeExclusive">): boolean {
  return video.storeExclusive !== false;
}

export function getStoreFeaturingLabel(
  video: Pick<Video, "storeFeaturing" | "models">,
  performerNames: string[]
): string | undefined {
  const custom = video.storeFeaturing?.trim();
  if (custom) return custom;
  if (performerNames.length) return performerNames.join(", ");
  return undefined;
}

export function parseStoreListingFields(formData: FormData): {
  description?: string;
  storeDurationLabel?: string;
  storeFeaturing?: string;
  storeExclusive: boolean;
} {
  const description = String(formData.get("description") ?? "").trim();
  const storeDurationLabel = String(formData.get("storeDurationLabel") ?? "").trim();
  const storeFeaturing = String(formData.get("storeFeaturing") ?? "").trim();
  const storeExclusive = formData.get("storeExclusive") === "on";

  return {
    description: description || undefined,
    storeDurationLabel: storeDurationLabel || undefined,
    storeFeaturing: storeFeaturing || undefined,
    storeExclusive,
  };
}
