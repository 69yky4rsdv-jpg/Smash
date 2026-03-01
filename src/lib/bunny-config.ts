/**
 * Bunny.net API config for SmashPov (smashpov.com).
 * Set env vars so the admin import can use them without typing credentials.
 * BUNNY_STREAM_ACCESS_KEY, BUNNY_LIBRARY_ID, BUNNY_VIDEO_PULL_ZONE, BUNNY_THUMBNAIL_PULL_ZONE (optional)
 */

export type BunnyStreamConfig = {
  streamAccessKey: string;
  libraryId: string;
  videoPullZone: string;
  thumbnailPullZone: string;
};

export function getBunnyStreamConfig(): BunnyStreamConfig | null {
  const streamAccessKey = process.env.BUNNY_STREAM_ACCESS_KEY?.trim();
  const libraryId = process.env.BUNNY_LIBRARY_ID?.trim();
  const videoPullZone = process.env.BUNNY_VIDEO_PULL_ZONE?.trim();
  const thumbnailPullZone = process.env.BUNNY_THUMBNAIL_PULL_ZONE?.trim() ?? "";

  if (!streamAccessKey || !libraryId || !videoPullZone) return null;

  return {
    streamAccessKey,
    libraryId,
    videoPullZone,
    thumbnailPullZone
  };
}

/** True when Bunny Stream env config is set (enabled for this deployment, e.g. smashpov.com). */
export function isBunnyStreamEnabled(): boolean {
  return getBunnyStreamConfig() !== null;
}
