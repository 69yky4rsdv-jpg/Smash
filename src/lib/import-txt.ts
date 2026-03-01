import { getCategories, getModels, getVideos, updateVideo } from "./data";
import { getOrCreateCategory, getOrCreateModel } from "./admin";

export type TxtMetadataEntry = {
  videoKey: string;
  /** When parsed from table format: "HD Video", "Hardcore Photoset", etc. */
  type?: string;
  performers: string[];
  categories: string[];
};

/**
 * Normalize a video title/code for matching (lowercase, trim, collapse spaces).
 */
function normalizeKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Extract last 4 digits for matching (e.g. HDVS2273 -> "2273"). */
function getLast4Digits(s: string): string | null {
  const t = String(s ?? "").trim();
  if (t.length >= 4 && /^\d{4}$/.test(t.slice(-4))) return t.slice(-4);
  const m = t.match(/\d{4}(?!\d)/g);
  return m ? m[m.length - 1]! : null;
}

function parseList(s: string): string[] {
  return s
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/**
 * Detect table format: header contains "Name", "Type", "Performer", "Artists", "Categories".
 */
function isTableFormat(lines: string[]): boolean {
  if (lines.length < 2) return false;
  const header = lines[0].toLowerCase();
  return (
    header.includes("name") &&
    (header.includes("performer") || header.includes("artist")) &&
    header.includes("categor")
  );
}

/**
 * Parse table rows: Name | Type | Performer | Artists | Categories
 * Returns entries keyed by Name (video code) with performers from Artists (or Performer) and categories from Categories.
 */
function parseTableFormat(lines: string[]): TxtMetadataEntry[] {
  const result: TxtMetadataEntry[] = [];
  let i = 0;
  if (lines.length === 0) return result;
  i++; // skip header
  while (i < lines.length && !lines[i]) i++; // skip empty
  if (i < lines.length && /^[\s|=|-]+$/.test(lines[i].replace(/\|/g, ""))) i++; // skip separator line (===== | ==== | ...)

  while (i < lines.length) {
    const row = lines[i];
    if (!row) { i++; continue; }
    const parts = row.split("|").map((p) => p.trim());
    if (parts.length >= 5) {
      const name = parts[0];
      const typeCol = parts[1] ?? "";
      const performer = parts[2];
      const artistsRaw = parts[3] ?? "";
      const categoriesRaw = parts[4] ?? "";
      if (!name) {
        i++;
        continue;
      }
      const performers = parseList(artistsRaw).length > 0 ? parseList(artistsRaw) : (performer ? [performer] : []);
      const categories = parseList(categoriesRaw);
      result.push({
        videoKey: normalizeKey(name),
        type: typeCol || undefined,
        performers,
        categories
      });
    } else if (parts.length >= 3) {
      const name = parts[0];
      const performers = parts.length >= 4 ? parseList(parts[3]) : parseList(parts[1]);
      const categories = parts.length >= 5 ? parseList(parts[4]) : parseList(parts[2]);
      if (name) result.push({ videoKey: normalizeKey(name), performers, categories });
    }
    i++;
  }
  return result;
}

/**
 * Parse a txt file into per-video metadata.
 * Supported formats:
 * 1. Table: "Name | Type | Performer | Artists | Categories" with separator line, then data rows (e.g. HDVS2273 | HD Video | Daphne Rosen | Daphne Rosen, Dirty Harry | Handjob, Anal, ...)
 * 2. Simple line: "Video Title | Performer1, Performer2 | Category1, Category2"
 * 3. Block format with --- and Performers:/Categories: lines
 */
export function parseTxtMetadata(txt: string): TxtMetadataEntry[] {
  const lines = txt.split(/\r?\n/).map((l) => l.trim());
  const nonEmpty = lines.filter(Boolean);

  if (isTableFormat(nonEmpty)) {
    return parseTableFormat(nonEmpty);
  }

  const result: TxtMetadataEntry[] = [];
  let i = 0;

  const blockRegex = /^---\s*$/;
  while (i < lines.length) {
    const line = lines[i];
    if (!line) {
      i++;
      continue;
    }
    if (line.match(blockRegex)) {
      i++;
      const blockLines: string[] = [];
      while (i < lines.length && !lines[i].match(blockRegex)) {
        if (lines[i]) blockLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      const title = blockLines[0]?.trim() ?? "";
      let performers: string[] = [];
      let categories: string[] = [];
      for (let j = 1; j < blockLines.length; j++) {
        const bl = blockLines[j];
        const perfMatch = /^performers?:\s*(.+)$/i.exec(bl);
        const catMatch = /^categor(y|ies):\s*(.+)$/i.exec(bl);
        if (perfMatch) performers = parseList(perfMatch[1]);
        if (catMatch) categories = parseList(catMatch[2]);
      }
      if (title) result.push({ videoKey: normalizeKey(title), performers, categories });
      continue;
    }

    const parts = line.includes("|") ? line.split("|").map((p) => p.trim()) : line.split(/\t/).map((p) => p.trim());
    if (parts.length >= 1 && parts[0]) {
      const videoKey = normalizeKey(parts[0]);
      const performers = parts.length >= 2 ? parseList(parts[1]) : [];
      const categories = parts.length >= 3 ? parseList(parts[2]) : [];
      result.push({ videoKey, performers, categories });
    }
    i++;
  }

  return result;
}

/**
 * Apply parsed txt metadata to existing videos: create missing models/categories,
 * then assign them to videos by matching code to video id, title, or last 4 digits.
 */
export function applyTxtMetadataToVideos(entries: TxtMetadataEntry[]): {
  videosUpdated: number;
  modelsCreated: number;
  categoriesCreated: number;
} {
  const modelsBefore = getModels().length;
  const categoriesBefore = getCategories().length;

  const byKey = new Map<string, { performers: string[]; categories: string[] }>();
  for (const entry of entries) {
    const existing = byKey.get(entry.videoKey) ?? { performers: [], categories: [] };
    existing.performers.push(...entry.performers.filter(Boolean));
    existing.categories.push(...entry.categories.filter(Boolean));
    byKey.set(entry.videoKey, existing);
  }

  function videoMatchesCode(value: string, codeKey: string): boolean {
    const key = normalizeKey(value);
    if (key === codeKey) return true;
    if (key.includes(codeKey) || codeKey.includes(key)) return true;
    return false;
  }

  const codeDigits = new Map<string, string | null>();
  function digitsForCode(codeKey: string): string | null {
    if (!codeDigits.has(codeKey)) codeDigits.set(codeKey, getLast4Digits(codeKey));
    return codeDigits.get(codeKey)!;
  }

  let videosUpdated = 0;
  const videos = getVideos(true);
  for (const [videoKey, { performers, categories }] of byKey) {
    const digits = digitsForCode(videoKey);
    const video = videos.find(
      (v) =>
        videoMatchesCode(v.title, videoKey) ||
        videoMatchesCode(v.id, videoKey) ||
        (digits != null && (getLast4Digits(v.id) === digits || getLast4Digits(v.title) === digits))
    );
    if (!video) continue;

    const modelIds: string[] = [];
    for (const name of [...new Set(performers)]) {
      const model = getOrCreateModel(name);
      modelIds.push(model.id);
    }

    const categoryIds: string[] = [];
    for (const name of [...new Set(categories)]) {
      const cat = getOrCreateCategory(name);
      categoryIds.push(cat.id);
    }

    const newModelIds = [...new Set([...video.models, ...modelIds])];
    const newCategoryIds = [...new Set([...video.categories, ...categoryIds])];
    if (
      newModelIds.length !== video.models.length ||
      newCategoryIds.length !== video.categories.length
    ) {
      updateVideo(video.id, { models: newModelIds, categories: newCategoryIds });
      videosUpdated++;
    }
  }

  const modelsCreated = getModels().length - modelsBefore;
  const categoriesCreated = getCategories().length - categoriesBefore;

  return {
    videosUpdated,
    modelsCreated,
    categoriesCreated
  };
}
