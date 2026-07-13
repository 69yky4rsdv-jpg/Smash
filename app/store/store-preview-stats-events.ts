export function notifyStorePreviewStatsRefresh(videoId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("store-preview-stats-refresh", { detail: { videoId } }));
}
