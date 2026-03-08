import { getModels, getVideos, updateVideo } from "./data";
import type { Video } from "./types";
import { parseTxtMetadata, type TxtMetadataEntry } from "./import-txt";

function normalizeKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getLast4Digits(s: string): string | null {
  const t = String(s ?? "").trim();
  if (t.length >= 4 && /^\d{4}$/.test(t.slice(-4))) return t.slice(-4);
  const m = t.match(/\d{4}(?!\d)/g);
  return m ? m[m.length - 1]! : null;
}

function videoMatchesCode(value: string, codeKey: string): boolean {
  const key = normalizeKey(value);
  if (key === codeKey) return true;
  if (key.includes(codeKey) || codeKey.includes(key)) return true;
  const digits = getLast4Digits(codeKey);
  if (digits != null && (getLast4Digits(value) === digits)) return true;
  return false;
}

/** Get performer names for a video: from TXT entry if matched, else from linked models. */
function getPerformerNames(video: Video, txtByKey: Map<string, TxtMetadataEntry>): string[] {
  const videos = getVideos(true);
  const models = getModels();
  const modelNames = new Map(models.map((m) => [m.id, m.stageName]));

  for (const [videoKey, entry] of txtByKey) {
    if (
      videoMatchesCode(video.title, videoKey) ||
      videoMatchesCode(video.id, videoKey) ||
      (getLast4Digits(videoKey) != null &&
        (getLast4Digits(video.id) === getLast4Digits(videoKey) ||
          getLast4Digits(video.title) === getLast4Digits(videoKey)))
    ) {
      if (entry.performers.length > 0) return [...new Set(entry.performers)];
      break;
    }
  }

  const fromModels = (video.models || [])
    .map((id) => modelNames.get(id))
    .filter(Boolean) as string[];
  return fromModels;
}

/** Build search query — comma-separated names match how Google returns scene titles. */
function buildSearchQuery(performerNames: string[]): string {
  const names = performerNames.filter(Boolean).slice(0, 4);
  if (names.length === 0) return "";
  if (names.length === 1) return `${names[0]} scene`;
  return names.join(", ");
}

/** Decode common HTML entities in scraped text. */
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function addCandidate(candidates: string[], raw: string, minLen = 12, maxLen = 220): void {
  const decoded = decodeHtmlEntities(raw.trim());
  if (decoded.length < minLen || decoded.length > maxLen) return;
  if (/^(sign in|login|watch|free trial|duckduckgo|google|\.\.\.)$/i.test(decoded)) return;
  if (/^https?:\/\//i.test(decoded)) return;
  candidates.push(decoded);
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};

/**
 * Parse Google search HTML for organic result titles (same as copy-paste from results).
 * Titles appear in <h3> or link text; snippets often repeat the full title.
 */
function parseGoogleHtml(html: string): string[] {
  const candidates: string[] = [];
  // Google: result title in <h3> (often with a link inside or wrapping)
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  let m: RegExpExecArray | null;
  while ((m = h3Regex.exec(html)) !== null) {
    const inner = m[1]!.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (inner) addCandidate(candidates, inner, 10, 220);
  }
  // Also catch "data-ved" result blocks with link text (backup)
  const linkInBlock = /<div[^>]+data-ved[^>]*>[\s\S]*?<a[^>]+href="[^"]*http[^"]*"[^>]*>([^<]+)</gi;
  while ((m = linkInBlock.exec(html)) !== null) {
    const t = m[1]!.replace(/<[^>]+>/g, "").trim();
    if (t) addCandidate(candidates, t, 15, 220);
  }
  // Snippet sentences that look like full titles (e.g. "Liz Honey and Valentina Velasquez get wild with...")
  const snippetRegex = /<div[^>]*class="[^"]*VwiC3b[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+(?:\.\.\.)?)<\/span>/gi;
  while ((m = snippetRegex.exec(html)) !== null) {
    const s = m[1]!.replace(/<[^>]+>/g, "").trim();
    if (s.length >= 20 && /[a-z]/.test(s)) addCandidate(candidates, s, 20, 220);
  }
  return [...new Set(candidates)];
}

/** Fetch Google HTML search and extract result titles (no API key). */
async function searchTitlesGoogle(query: string): Promise<string[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://www.google.com/search?q=${encoded}&num=10`;
  try {
    const res = await fetch(url, { next: { revalidate: 0 }, headers: BROWSER_HEADERS });
    if (!res.ok) return [];
    const html = await res.text();
    return parseGoogleHtml(html);
  } catch {
    return [];
  }
}

/**
 * Fetch DuckDuckGo HTML search and parse result titles (no API key).
 */
async function searchTitlesDuckDuckGo(query: string): Promise<string[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://html.duckduckgo.com/html/?q=${encoded}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 0 },
      headers: BROWSER_HEADERS
    });
    if (!res.ok) return [];
    const html = await res.text();
    const candidates: string[] = [];
    const linkPatterns = [
      /class="result__a"[^>]*>([^<]+)</g,
      /class="[^"]*result__a[^"]*"[^>]*>([^<]+)</gi,
      /class="[^"]*result__title[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)</gi,
      /data-nrn="result"[^>]*>[\s\S]*?<a[^>]*>([^<]+)</gi,
      /<a[^>]+class="[^"]*result__a[^"]*"[^>]*>([\s\S]*?)<\/a>/gi
    ];
    for (const re of linkPatterns) {
      re.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = re.exec(html)) !== null) {
        const raw = match[1]!.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (raw) addCandidate(candidates, raw, 12, 220);
      }
    }
    return [...new Set(candidates)];
  } catch {
    return [];
  }
}

type SearchResult = { candidates: string[]; source: "google" | "duckduckgo" | "serpapi" };

/** Use SerpAPI when key is set; else try Google HTML then DuckDuckGo. Returns candidates and source for debug. */
async function searchTitlesForPerformers(
  query: string,
  apiKey?: string
): Promise<SearchResult> {
  if (apiKey) {
    const encoded = encodeURIComponent(query);
    const url = `https://serpapi.com/search.json?q=${encoded}&api_key=${apiKey}&num=10`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`Search API error: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as {
      organic_results?: Array<{ title?: string; snippet?: string }>;
      error?: string;
    };
    if (data.error) throw new Error(data.error);
    const candidates: string[] = [];
    for (const r of data.organic_results ?? []) {
      if (r.title && typeof r.title === "string") {
        const t = r.title.trim();
        if (t.length > 10 && t.length < 220) candidates.push(t);
      }
      if (r.snippet && typeof r.snippet === "string") {
        const s = r.snippet.replace(/<[^>]+>/g, "").trim();
        if (s.length > 15 && s.length < 220) candidates.push(s);
      }
    }
    return { candidates: [...new Set(candidates)], source: "serpapi" };
  }
  const fromGoogle = await searchTitlesGoogle(query);
  if (fromGoogle.length > 0) return { candidates: fromGoogle, source: "google" };
  const fromDd = await searchTitlesDuckDuckGo(query);
  return { candidates: fromDd, source: "duckduckgo" };
}

/** Check if candidate contains a performer name (exact or fuzzy: typo like Velasques vs Velasquez). */
function candidateHasPerformer(candidate: string, performerNames: string[]): boolean {
  const lower = candidate.toLowerCase();
  for (const name of performerNames) {
    if (!name || name.length < 2) continue;
    const n = name.toLowerCase();
    if (lower.includes(n)) return true;
    const firstWord = n.split(/\s+/)[0];
    if (firstWord && firstWord.length >= 4 && lower.includes(firstWord)) return true;
    const withoutLast = n.slice(0, -1);
    if (withoutLast.length >= 5 && lower.includes(withoutLast)) return true;
  }
  return false;
}

/**
 * Score a candidate title. Prefer format like:
 * "Liz Honey And Valentina Velasques Are Skanks" / "Name and Name - Action"
 * Uses fuzzy performer match so typos (e.g. Velasques) still score.
 */
function scoreTitle(candidate: string, performerNames: string[]): number {
  const lower = candidate.toLowerCase();
  const trimmed = candidate.trim();
  let score = 0;

  if (/^(sign in|login|watch|free trial|duckduckgo|google|\.\.\.)$/i.test(trimmed)) return 0;
  if (/[<>\"']/.test(candidate)) return 0;
  if (trimmed.length < 10 || trimmed.length > 200) return 0;

  if (trimmed.length >= 20 && trimmed.length <= 120) score += 15;
  else if (trimmed.length >= 10 && trimmed.length <= 180) score += 5;

  let namesFound = 0;
  for (const name of performerNames) {
    if (!name || name.length < 2) continue;
    const n = name.toLowerCase();
    if (lower.includes(n)) namesFound++;
    else {
      const firstWord = n.split(/\s+/)[0];
      if (firstWord && firstWord.length >= 4 && lower.includes(firstWord)) namesFound++;
    }
  }
  if (namesFound === 0) return 0;
  score += 10 + namesFound * 10;

  if (/ - /.test(candidate)) score += 15;
  if (/,/.test(candidate)) score += 10;
  if (/\s+and\s+/i.test(candidate)) score += 10;
  if (/^[A-Z]/.test(candidate) && !/^[A-Z\s]+$/.test(candidate)) score += 5;

  return score;
}

/** Pick the best title from the first 5 results. If we have results but all score 0, use first (so we still update). */
function pickBestTitle(
  candidates: string[],
  performerNames: string[],
  currentTitle: string
): string {
  const options = candidates.slice(0, 5);
  if (options.length === 0) return currentTitle;
  let best = options[0]!;
  let bestScore = scoreTitle(best, performerNames);
  for (let i = 1; i < options.length; i++) {
    const c = options[i]!;
    const s = scoreTitle(c, performerNames);
    if (s > bestScore) {
      bestScore = s;
      best = c;
    }
  }
  if (bestScore === 0 && candidateHasPerformer(best, performerNames)) bestScore = 1;
  if (bestScore === 0) return currentTitle;
  return best;
}

export type MassTitleDebugItem = {
  videoId: string;
  videoTitle: string;
  query: string;
  source: "google" | "duckduckgo" | "serpapi";
  candidatesCount: number;
  candidates: string[];
  chosenTitle: string;
  updated: boolean;
};

export type MassTitleResult = {
  updated: number;
  skipped: number;
  errors: string[];
  debug?: MassTitleDebugItem[];
};

/**
 * For each selected video: match to TXT entry (name + performers), get performer names,
 * search for title suggestions (DuckDuckGo HTML by default; SerpAPI if SERPAPI_KEY is set),
 * pick best title and update video. No API key required.
 */
export async function generateTitlesForVideos(
  selectedVideoIds: string[],
  txtContent: string
): Promise<MassTitleResult> {
  const apiKey = process.env.SERPAPI_KEY?.trim();
  const entries = parseTxtMetadata(txtContent);
  const txtByKey = new Map(entries.map((e) => [e.videoKey, e]));
  const videos = getVideos(true);
  const result: MassTitleResult = { updated: 0, skipped: 0, errors: [], debug: [] };

  for (const videoId of selectedVideoIds) {
    const video = videos.find((v) => v.id === videoId);
    if (!video) {
      result.errors.push(`Video not found: ${videoId}`);
      result.skipped++;
      continue;
    }

    const performerNames = getPerformerNames(video, txtByKey);
    const query = buildSearchQuery(performerNames);
    if (!query) {
      result.errors.push(`No performers for "${video.title}". Add TXT row or link models.`);
      result.skipped++;
      continue;
    }

    try {
      const { candidates, source } = await searchTitlesForPerformers(query, apiKey);
      const newTitle = pickBestTitle(candidates, performerNames, video.title);
      const didUpdate = newTitle !== video.title;
      if (didUpdate) {
        updateVideo(videoId, { title: newTitle });
        result.updated++;
      } else {
        result.skipped++;
      }
      result.debug!.push({
        videoId,
        videoTitle: video.title,
        query,
        source,
        candidatesCount: candidates.length,
        candidates: candidates.slice(0, 10),
        chosenTitle: newTitle,
        updated: didUpdate
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`${video.title}: ${msg}`);
      result.skipped++;
      result.debug!.push({
        videoId,
        videoTitle: video.title,
        query,
        source: "duckduckgo",
        candidatesCount: 0,
        candidates: [],
        chosenTitle: video.title,
        updated: false
      });
    }
  }

  return result;
}
