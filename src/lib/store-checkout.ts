/** Public site origin used for Stripe success redirects and admin copy links. */
export function getSiteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://smashpov.com").replace(/\/$/, "");
}

/** Stripe "after payment" redirect URL for a store video purchase. */
export function getStorePurchaseSuccessUrl(videoId: string): string {
  return `${getSiteBaseUrl()}/store/success?videoId=${encodeURIComponent(videoId)}`;
}

const AUTO_STORE_PRICE_TIERS = [14.99, 17.99, 19.99, 22.99, 24.99, 27.99] as const;

export function getAutoStoreVideoPrice(videoId: string): number {
  const hash = Array.from(videoId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AUTO_STORE_PRICE_TIERS[hash % AUTO_STORE_PRICE_TIERS.length]!;
}

export function getStoreVideoPrice(video: { id: string; storePrice?: number }): number {
  if (typeof video.storePrice === "number" && video.storePrice > 0) {
    return video.storePrice;
  }
  return getAutoStoreVideoPrice(video.id);
}

export function parseStorePrice(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = parseFloat(trimmed);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.round(value * 100) / 100;
}
