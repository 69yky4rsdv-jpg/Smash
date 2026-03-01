/**
 * Bunny.net Stream API – list videos and build HLS/thumbnail URLs.
 * API docs: https://docs.bunny.net/reference/video_list
 */

export type BunnyVideo = {
  guid: string;
  title: string;
  description?: string | null;
  dateUploaded: string;
  thumbnailFileName?: string | null;
  status: number;
};

export type BunnyListResponse = {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  items: BunnyVideo[] | null;
};

const BASE = "https://video.bunnycdn.com";

/**
 * Fetch one page of videos from a Bunny Stream library.
 * Auth: AccessKey header (Stream API key from Bunny dashboard).
 */
export async function fetchBunnyVideosPage(
  libraryId: string,
  accessKey: string,
  page = 1,
  itemsPerPage = 100
): Promise<BunnyListResponse> {
  const url = `${BASE}/library/${libraryId}/videos?page=${page}&itemsPerPage=${itemsPerPage}`;
  const res = await fetch(url, {
    headers: { AccessKey: accessKey },
    cache: "no-store"
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny API ${res.status}: ${text}`);
  }
  return res.json() as Promise<BunnyListResponse>;
}

/**
 * Fetch all videos from the library (paginates until done).
 */
export async function fetchAllBunnyVideos(
  libraryId: string,
  accessKey: string
): Promise<BunnyVideo[]> {
  const all: BunnyVideo[] = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const data = await fetchBunnyVideosPage(libraryId, accessKey, page);
    const items = data.items ?? [];
    all.push(...items);
    hasMore = all.length < data.totalItems;
    page++;
  }
  return all;
}

/**
 * Build HLS playlist URL for a video.
 * @param pullZoneHostname - e.g. "vz-c0889f21-9e9" (no .b-cdn.net)
 */
export function buildBunnyHlsUrl(pullZoneHostname: string, guid: string): string {
  const host = pullZoneHostname.replace(/\.b-cdn\.net$/i, "");
  return `https://${host}.b-cdn.net/${guid}/playlist.m3u8`;
}

/**
 * Build thumbnail URL if you use a separate pull zone for thumbnails.
 * Bunny Stream often stores thumbnails as {guid}/thumbnail_xxx.jpg; adjust pattern if needed.
 */
export function buildBunnyThumbnailUrl(
  thumbnailPullZoneHostname: string,
  guid: string,
  thumbnailFileName?: string | null
): string | undefined {
  if (!thumbnailFileName) return undefined;
  const host = thumbnailPullZoneHostname.replace(/\.b-cdn\.net$/i, "");
  return `https://${host}.b-cdn.net/${guid}/${thumbnailFileName}`;
}
