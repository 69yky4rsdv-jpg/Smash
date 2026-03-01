/**
 * Import PhotoSets from Bunny Storage into video photo galleries.
 * Matches by last 4 digits. When TXT is provided: requires both a video row and a photoset row
 * in the TXT for that digit with matching model/performer names, then adds the photoset to the video.
 */

import {
  listBunnySubdirNames,
  listBunnyFileNames,
  buildPhotoCdnUrl,
} from "./bunny-storage";
import { getVideos, getModels } from "./data";
import { setVideoPhotos, updateVideo } from "./data";
import { parseTxtMetadata, type TxtMetadataEntry } from "./import-txt";
import { getOrCreateModel, getOrCreateCategory } from "./admin";

function normalizeKey(s: string): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Extract last 2, 3, or 4 digits from a string (e.g. HCPS0606 -> "0606", HCPS064 -> "064", HCP77 -> "77"). */
export function getLast4Digits(value: string): string | null {
  const s = String(value || "").trim();
  if (s.length >= 4) {
    const last4 = s.slice(-4);
    if (/^\d{4}$/.test(last4)) return last4;
  }
  if (s.length >= 3) {
    const last3 = s.slice(-3);
    if (/^\d{3}$/.test(last3)) return last3;
  }
  if (s.length >= 2) {
    const last2 = s.slice(-2);
    if (/^\d{2}$/.test(last2)) return last2;
  }
  const match = s.match(/\d{2,4}(?!\d)/g);
  return match ? match[match.length - 1]! : null;
}

/** Normalize digit string for comparison so "0457" and "457" match, "064" and "64" match. */
function normalizeDigits(d: string | null): string | null {
  if (d == null || d === "") return null;
  const t = d.replace(/^0+/, "") || "0";
  return t;
}

function digitsMatch(a: string | null, b: string | null): boolean {
  if (a == null || b == null) return a === b;
  return normalizeDigits(a) === normalizeDigits(b);
}

/** True if id or title contains this digit code (raw or normalized) so we match "0077", "77", "0457", "457" in any position. */
function videoIdOrTitleContainsDigits(
  id: string,
  title: string,
  digits: string
): boolean {
  const normId = normalizeKey(id);
  const normTitle = normalizeKey(title);
  const normD = normalizeDigits(digits);
  if (!digits && !normD) return false;
  const hasRaw = digits && (normId.includes(digits) || normTitle.includes(digits));
  const hasNorm = normD != null && (normId.includes(normD) || normTitle.includes(normD));
  return hasRaw || hasNorm === true;
}

/** Normalize performer name for comparison (lowercase, trim). */
function normPerformer(p: string): string {
  return p.trim().toLowerCase();
}

/** True if two performer lists refer to the same models (sets match or one is subset). */
function performerSetsMatch(a: string[], b: string[]): boolean {
  const setA = new Set(a.map(normPerformer).filter(Boolean));
  const setB = new Set(b.map(normPerformer).filter(Boolean));
  if (setA.size === 0 && setB.size === 0) return true;
  if (setA.size === 0 || setB.size === 0) return false;
  for (const x of setA) {
    if (!setB.has(x)) return false;
  }
  for (const x of setB) {
    if (!setA.has(x)) return false;
  }
  return true;
}

function isVideoType(type: string | undefined): boolean {
  return /video/i.test(type ?? "");
}

/** Match "Hardcore Photoset", "Photo Set", "Photos", "Photo", etc. */
function isPhotosetType(type: string | undefined): boolean {
  return /photoset|photo\s*set|photos?\b/i.test(type ?? "");
}

/**
 * When TXT is provided: get TXT rows for this digit split into video rows and photoset rows.
 * If there is at least one video row and one photoset row whose performers match, return merged performers/categories and the video code for matching.
 */
function getTxtMatchForFolderByDigits(
  digits: string | null,
  folderKey: string,
  entries: TxtMetadataEntry[]
): { performers: string[]; categories: string[]; videoCode: string; match: true } | null {
  if (!digits) return null;
  const videoRows = entries.filter(
    (e) => digitsMatch(getLast4Digits(e.videoKey), digits) && isVideoType(e.type)
  );
  const photosetRows = entries.filter(
    (e) =>
      (digitsMatch(getLast4Digits(e.videoKey), digits) && isPhotosetType(e.type)) ||
      e.videoKey === folderKey
  );
  if (videoRows.length === 0 || photosetRows.length === 0) return null;

  for (const vr of videoRows) {
    for (const pr of photosetRows) {
      if (performerSetsMatch(vr.performers, pr.performers)) {
        const performersSet = new Set<string>();
        const categoriesSet = new Set<string>();
        vr.performers.forEach((p) => p && performersSet.add(p.trim()));
        pr.performers.forEach((p) => p && performersSet.add(p.trim()));
        vr.categories.forEach((c) => c && categoriesSet.add(c.trim()));
        pr.categories.forEach((c) => c && categoriesSet.add(c.trim()));
        return {
          performers: [...performersSet],
          categories: [...categoriesSet],
          videoCode: vr.videoKey,
          match: true,
        };
      }
    }
  }
  return null;
}

/** Get any TXT entry code for this digit (video or photoset row) to help find DB video by code when full txtMatch is null. */
function getAnyTxtCodeForDigits(
  digits: string | null,
  folderKey: string,
  entries: TxtMetadataEntry[]
): string | null {
  if (!digits || entries.length === 0) return null;
  const withDigits = entries.filter((e) => digitsMatch(getLast4Digits(e.videoKey), digits));
  const videoRow = withDigits.find((e) => isVideoType(e.type));
  const photosetRow = withDigits.find((e) => isPhotosetType(e.type) || e.videoKey === folderKey);
  return (videoRow?.videoKey ?? photosetRow?.videoKey ?? withDigits[0]?.videoKey) ?? null;
}

/** All videos whose id or title matches the given digits, or contains the optional full code (e.g. "hdvs0077"). */
function findVideosByLast4Digits(
  digits: string | null,
  optionalVideoCode?: string | null
): { id: string; modelIds: string[] }[] {
  if (!digits && !optionalVideoCode) return [];
  const videos = getVideos(true);
  return videos
    .filter((v) => {
      const normId = normalizeKey(v.id);
      const normTitle = normalizeKey(v.title);
      if (optionalVideoCode && (normId.includes(optionalVideoCode) || normTitle.includes(optionalVideoCode)))
        return true;
      if (!digits) return false;
      return (
        digitsMatch(getLast4Digits(v.id), digits) ||
        digitsMatch(getLast4Digits(v.title), digits) ||
        videoIdOrTitleContainsDigits(v.id, v.title, digits)
      );
    })
    .map((v) => ({ id: v.id, modelIds: v.models ?? [] }));
}

/** First video with that last 4 digits (or whose id/title contains optionalVideoCode). */
function findVideoByLast4Digits(
  digits: string | null,
  optionalVideoCode?: string | null
): { id: string } | null {
  const list = findVideosByLast4Digits(digits, optionalVideoCode);
  return list.length > 0 ? { id: list[0].id } : null;
}

/**
 * When TXT is used: pick a video with that last 4 digits (or videoCode) whose assigned models
 * match the TXT performers. If none match, returns null (caller can fall back to digits-only).
 */
function findVideoByLast4DigitsWithMatchingModels(
  digits: string | null,
  txtPerformerNames: string[],
  optionalVideoCode?: string | null
): { id: string } | null {
  const candidates = findVideosByLast4Digits(digits, optionalVideoCode);
  if (candidates.length === 0) return null;
  const modelsList = getModels();
  const idToStageName = new Map(modelsList.map((m) => [m.id, m.stageName.trim().toLowerCase()]));

  for (const v of candidates) {
    const videoStageNames = v.modelIds
      .map((id) => idToStageName.get(id))
      .filter(Boolean) as string[];
    if (performerSetsMatch(videoStageNames, txtPerformerNames)) return { id: v.id };
  }
  for (const v of candidates) {
    if (v.modelIds.length === 0 && txtPerformerNames.length > 0) return { id: v.id };
  }
  return null;
}

export type ImportPhotoSetsOptions = {
  storageZoneName: string;
  storageAccessKey: string;
  storageHost?: string;
  /** Path to the folder that contains photoset subfolders (e.g. "PhotoSets" or "Folder pics/PhotoSets"). */
  photosetsPath: string;
  /** Pull zone host for public URLs (e.g. "Pull-Video-Load.b-cdn.net"). */
  pullZoneHost: string;
  /** Optional path prefix for URLs (e.g. "Folder pics"). */
  urlPrefix?: string;
  /** Only include these file extensions (default: common image extensions). */
  imageExtensions?: Set<string>;
  /**
   * Optional TXT metadata (same format as TXT metadata import).
   * When provided, videos are matched primarily by Name/code from the TXT;
   * video models and categories are updated to match the TXT so performer names align.
   */
  txtMetadata?: string;
};

const DEFAULT_IMAGE_EXT = new Set(
  [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"].map((e) => e.toLowerCase())
);

function isImageFile(name: string, extSet: Set<string>): boolean {
  const lower = name.toLowerCase();
  return [...extSet].some((ext) => lower.endsWith(ext));
}

export type ImportPhotoSetsResult = {
  photosetsProcessed: number;
  videosUpdated: number;
  thumbnailsSet: number;
  errors: string[];
};

/** Import all photoset folders from Bunny Storage: add photos to matching videos and set thumbnail to first photo when missing. Uses TXT metadata for matching and to sync model/category names when provided. */
export async function importPhotoSetsFromBunny(
  options: ImportPhotoSetsOptions
): Promise<ImportPhotoSetsResult> {
  const {
    storageZoneName,
    storageAccessKey,
    storageHost = "storage.bunnycdn.com",
    photosetsPath,
    pullZoneHost,
    urlPrefix,
    imageExtensions = DEFAULT_IMAGE_EXT,
    txtMetadata,
  } = options;

  const result: ImportPhotoSetsResult = {
    photosetsProcessed: 0,
    videosUpdated: 0,
    thumbnailsSet: 0,
    errors: [],
  };

  let txtEntries: TxtMetadataEntry[] = [];
  if (txtMetadata && txtMetadata.trim()) {
    try {
      txtEntries = parseTxtMetadata(txtMetadata.trim());
    } catch (e) {
      result.errors.push("TXT parse failed: " + (e instanceof Error ? e.message : String(e)));
      return result;
    }
  }

  let folderNames: string[];
  try {
    folderNames = await listBunnySubdirNames(
      storageZoneName,
      photosetsPath,
      storageAccessKey,
      storageHost
    );
  } catch (e) {
    result.errors.push(e instanceof Error ? e.message : String(e));
    return result;
  }

  for (const folderName of folderNames) {
    result.photosetsProcessed++;
    const digits = getLast4Digits(folderName);
    const folderKey = normalizeKey(folderName);

    if (!digits) continue;

    const txtMatch =
      txtEntries.length > 0 ? getTxtMatchForFolderByDigits(digits, folderKey, txtEntries) : null;
    const videoCode =
      txtMatch?.videoCode ??
      (txtEntries.length > 0 ? getAnyTxtCodeForDigits(digits, folderKey, txtEntries) : null);

    let videoMatch: { id: string } | null = null;
    if (txtMatch != null) {
      videoMatch = findVideoByLast4DigitsWithMatchingModels(
        digits,
        txtMatch.performers,
        videoCode
      );
      if (!videoMatch) {
        videoMatch = findVideoByLast4Digits(digits, videoCode);
      }
    } else {
      videoMatch = findVideoByLast4Digits(digits, videoCode);
    }

    if (!videoMatch) continue;

    const dirPath = photosetsPath ? `${photosetsPath}/${folderName}` : folderName;
    let fileNames: string[];
    try {
      fileNames = await listBunnyFileNames(
        storageZoneName,
        dirPath,
        storageAccessKey,
        storageHost
      );
    } catch (e) {
      result.errors.push(`${folderName}: ${e instanceof Error ? e.message : String(e)}`);
      continue;
    }

    const imageFiles = fileNames.filter((name) => isImageFile(name, imageExtensions));
    if (imageFiles.length === 0) continue;

    const urls = imageFiles.map((fileName) => {
      const relativePath = photosetsPath ? `${photosetsPath}/${folderName}/${fileName}` : `${folderName}/${fileName}`;
      return buildPhotoCdnUrl(pullZoneHost, relativePath, urlPrefix);
    });

    setVideoPhotos(videoMatch.id, urls);
    result.videosUpdated++;

    const videos = getVideos(true);
    const video = videos.find((v) => v.id === videoMatch.id);
    if (video && !video.thumbnailUrl && urls[0]) {
      updateVideo(videoMatch.id, { thumbnailUrl: urls[0] });
      result.thumbnailsSet++;
    }

    if (video && txtMatch && (txtMatch.performers.length > 0 || txtMatch.categories.length > 0)) {
      const modelIds: string[] = [];
      for (const name of txtMatch.performers) {
        const model = getOrCreateModel(name);
        modelIds.push(model.id);
      }
      const categoryIds: string[] = [];
      for (const name of txtMatch.categories) {
        const cat = getOrCreateCategory(name);
        categoryIds.push(cat.id);
      }
      updateVideo(videoMatch.id, {
        models: modelIds.length > 0 ? modelIds : undefined,
        categories: categoryIds.length > 0 ? categoryIds : undefined,
      });
    }
  }

  return result;
}
