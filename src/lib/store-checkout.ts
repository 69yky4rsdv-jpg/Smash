/** Public site origin used for Stripe success redirects and admin copy links. */
export function getSiteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://smashpov.com").replace(/\/$/, "");
}

/** Stripe "after payment" redirect URL for a store video purchase. */
export function getStorePurchaseSuccessUrl(videoId: string): string {
  return `${getSiteBaseUrl()}/store/success?videoId=${encodeURIComponent(videoId)}`;
}
