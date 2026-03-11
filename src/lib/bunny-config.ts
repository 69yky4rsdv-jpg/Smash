/**
 * Bunny.net API config.
 *
 * Preferred: set env vars in .env.local so secrets are not checked into git:
 *   BUNNY_STREAM_ACCESS_KEY, BUNNY_LIBRARY_ID, BUNNY_VIDEO_PULL_ZONE, BUNNY_THUMBNAIL_PULL_ZONE (optional)
 *
 * If you're developing locally and don't want to deal with env files yet,
 * you can also drop your values into the HARDCODED_* constants below.
 * NEVER commit real keys to a public repo.
 */

export type BunnyStreamConfig = {
  streamAccessKey: string;
  libraryId: string;
  videoPullZone: string;
  thumbnailPullZone: string;
};

// Optional local-only fallback values. Leave these empty in git.
// You can temporarily paste your library id and API key here while working
// on your own machine, then remove them before pushing.
const HARDCODED_LIBRARY_ID = "";
const HARDCODED_ACCESS_KEY = "";
const HARDCODED_VIDEO_PULL_ZONE = "";
const HARDCODED_THUMBNAIL_PULL_ZONE = "";

export function getBunnyStreamConfig(): BunnyStreamConfig | null {
  const streamAccessKey =
    process.env.BUNNY_STREAM_ACCESS_KEY?.trim() || HARDCODED_ACCESS_KEY.trim();
  const libraryId =
    process.env.BUNNY_LIBRARY_ID?.trim() || HARDCODED_LIBRARY_ID.trim();
  const videoPullZone =
    process.env.BUNNY_VIDEO_PULL_ZONE?.trim() || HARDCODED_VIDEO_PULL_ZONE.trim();
  const thumbnailPullZone =
    process.env.BUNNY_THUMBNAIL_PULL_ZONE?.trim() ||
    HARDCODED_THUMBNAIL_PULL_ZONE.trim();

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
