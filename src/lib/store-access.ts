import { isIframeMediaUrl, normalizeStoreMediaUrl } from "./store-media-url";

export const DEFAULT_STORE_PREVIEW_SECONDS = 30;

export const STORE_PREVIEW_DURATION_OPTIONS = [
  { value: "30", label: "30 seconds from full video (default)" },
  { value: "0", label: "No preview — locked until purchase" },
] as const;

export function parseStorePreviewDuration(raw: string): number | undefined {
  const value = raw.trim();
  if (value === "0") return 0;
  if (value === "30" || value === "") return DEFAULT_STORE_PREVIEW_SECONDS;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_STORE_PREVIEW_SECONDS;
}

type StoreVideoMedia = {
  previewUrl?: string;
  videoUrl: string;
  /** undefined = use default 30s timed preview */
  previewDurationSeconds?: number;
};

export type StorePlayback = {
  src: string;
  mode: "full" | "preview" | "timed-preview" | "locked";
  maxDurationSeconds?: number;
};

function resolveTimedPreviewSeconds(video: StoreVideoMedia): number {
  if (video.previewDurationSeconds === 0) return 0;
  if (video.previewDurationSeconds && video.previewDurationSeconds > 0) {
    return video.previewDurationSeconds;
  }
  return DEFAULT_STORE_PREVIEW_SECONDS;
}

/** Pick what may play on the store preview page (never leaks full video without access). */
export function resolveStorePreviewPlayback(
  video: StoreVideoMedia,
  hasFullAccess: boolean
): StorePlayback {
  const fullSrc = normalizeStoreMediaUrl(video.videoUrl);
  const previewSrc = normalizeStoreMediaUrl(video.previewUrl ?? "");
  const distinctPreview = Boolean(previewSrc && previewSrc !== fullSrc);

  if (hasFullAccess) {
    if (fullSrc) return { src: fullSrc, mode: "full" };
    if (previewSrc) return { src: previewSrc, mode: "preview" };
    return { src: "", mode: "locked" };
  }

  if (distinctPreview) {
    return { src: previewSrc, mode: "preview" };
  }

  const timedSeconds = resolveTimedPreviewSeconds(video);
  if (timedSeconds > 0 && fullSrc && !isIframeMediaUrl(fullSrc)) {
    return { src: fullSrc, mode: "timed-preview", maxDurationSeconds: timedSeconds };
  }

  return { src: "", mode: "locked" };
}
