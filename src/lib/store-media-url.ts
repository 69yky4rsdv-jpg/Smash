/** Normalize pasted store media URLs (full video or preview). */
export function normalizeStoreMediaUrl(input: string): string {
  let url = input.trim();
  if (!url) return "";

  const iframeMatch = url.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch?.[1]) url = iframeMatch[1].trim();

  if (url.startsWith("//")) url = `https:${url}`;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    if (url.includes("b-cdn.net") || url.includes("mediadelivery.net")) {
      url = `https://${url.replace(/^\/+/, "")}`;
    } else if (url.startsWith("Pull-Video-Load.") || url.startsWith("pull-video-load.")) {
      url = `https://${url}`;
    } else {
      url = `https://Pull-Video-Load.b-cdn.net/${url.replace(/^\/+/, "")}`;
    }
  }

  return url;
}

export function isIframeMediaUrl(url: string): boolean {
  return /mediadelivery\.net/i.test(url);
}

export function isHlsMediaUrl(url: string): boolean {
  return /\.m3u8(\?|$)/i.test(url);
}
