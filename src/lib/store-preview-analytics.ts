import { createHash, randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getDataDir } from "./data";

export type StorePreviewVisitorType = "admin" | "bot" | "visitor";

export type StorePreviewEventType = "pageview" | "human_confirm" | "preview_play" | "buy_click";

export type StorePreviewVisit = {
  id: string;
  videoId: string;
  at: string;
  visitorType: StorePreviewVisitorType;
  userAgent?: string;
  referer?: string;
  ipHash?: string;
  humanConfirmed: boolean;
  events: StorePreviewEventType[];
};

type AnalyticsFile = {
  visits: StorePreviewVisit[];
};

const MAX_VISITS = 5000;

function getAnalyticsPath(): string {
  return join(getDataDir(), "store-preview-analytics.json");
}

function readAnalytics(): AnalyticsFile {
  const path = getAnalyticsPath();
  if (!existsSync(path)) return { visits: [] };
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as AnalyticsFile;
    return { visits: Array.isArray(raw.visits) ? raw.visits : [] };
  } catch {
    return { visits: [] };
  }
}

function writeAnalytics(data: AnalyticsFile): void {
  const dir = getDataDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const visits = data.visits.slice(-MAX_VISITS);
  writeFileSync(getAnalyticsPath(), JSON.stringify({ visits }, null, 2), "utf8");
}

export function hashIp(ip: string | null | undefined): string | undefined {
  if (!ip?.trim()) return undefined;
  return createHash("sha256").update(ip.trim()).digest("hex").slice(0, 16);
}

const DEFINITE_BOT_UA_PATTERNS = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "discordbot",
  "slackbot",
  "headlesschrome",
  "phantomjs",
  "selenium",
  "puppeteer",
  "curl/",
  "wget/",
  "python-requests",
  "go-http-client",
  "bytespider",
  "petalbot",
  "gptbot",
  "claudebot",
  "anthropic-ai",
  "ia_archiver",
  "applebot/",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "petalbot",
  "mediapartners-google",
];

/** Real browsers — including private/incognito — should not be treated as bots. */
const BROWSER_UA_HINTS = [
  "mozilla/5.0",
  "chrome/",
  "safari/",
  "firefox/",
  "edg/",
  "opr/",
  "samsungbrowser/",
];

export function isLikelyBrowser(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.trim().length < 12) return false;
  const lower = userAgent.toLowerCase();
  return BROWSER_UA_HINTS.some((hint) => lower.includes(hint));
}

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.trim().length < 12) return true;
  const lower = userAgent.toLowerCase();
  if (isLikelyBrowser(userAgent) && !DEFINITE_BOT_UA_PATTERNS.some((pattern) => lower.includes(pattern))) {
    return false;
  }
  return DEFINITE_BOT_UA_PATTERNS.some((pattern) => lower.includes(pattern));
}

function resolveVisitorType(input: {
  isAdmin: boolean;
  isLoggedIn?: boolean;
  userAgent?: string | null;
  humanConfirmed: boolean;
}): StorePreviewVisitorType {
  if (input.isAdmin) return "admin";
  if (isBotUserAgent(input.userAgent)) return "bot";
  // Real browser UA counts as a visitor even before JS runs (private mode, ad blockers, etc.).
  if (isLikelyBrowser(input.userAgent) || input.humanConfirmed || input.isLoggedIn) {
    return "visitor";
  }
  return "bot";
}

export function logStorePreviewPageView(input: {
  videoId: string;
  userAgent?: string | null;
  referer?: string | null;
  ip?: string | null;
  isAdmin: boolean;
  isLoggedIn?: boolean;
}): string {
  const data = readAnalytics();
  const visit: StorePreviewVisit = {
    id: randomUUID(),
    videoId: input.videoId,
    at: new Date().toISOString(),
    visitorType: resolveVisitorType({
      isAdmin: input.isAdmin,
      isLoggedIn: input.isLoggedIn,
      userAgent: input.userAgent,
      humanConfirmed: false,
    }),
    userAgent: input.userAgent?.slice(0, 300) || undefined,
    referer: input.referer?.slice(0, 500) || undefined,
    ipHash: hashIp(input.ip),
    humanConfirmed: false,
    events: ["pageview"],
  };
  data.visits.push(visit);
  writeAnalytics(data);
  return visit.id;
}

function findRecentVisit(videoId: string, visitId?: string, ipHash?: string): StorePreviewVisit | undefined {
  const visits = readAnalytics().visits;
  if (visitId) {
    const byId = visits.find((v) => v.id === visitId && v.videoId === videoId);
    if (byId) return byId;
  }
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (let i = visits.length - 1; i >= 0; i -= 1) {
    const visit = visits[i]!;
    if (visit.videoId !== videoId) continue;
    if (new Date(visit.at).getTime() < cutoff) break;
    if (ipHash && visit.ipHash === ipHash) return visit;
    if (!visit.humanConfirmed) return visit;
  }
  return undefined;
}

export function recordStorePreviewEvent(input: {
  videoId: string;
  event: StorePreviewEventType;
  visitId?: string;
  userAgent?: string | null;
  referer?: string | null;
  ip?: string | null;
  isAdmin?: boolean;
  isLoggedIn?: boolean;
}): void {
  const data = readAnalytics();
  const ipHash = hashIp(input.ip);
  let visit: StorePreviewVisit | undefined;

  if (input.visitId) {
    visit = data.visits.find((v) => v.id === input.visitId && v.videoId === input.videoId);
  }
  if (!visit) {
    visit = findRecentVisit(input.videoId, input.visitId, ipHash);
  }

  if (!visit) {
    visit = {
      id: input.visitId || randomUUID(),
      videoId: input.videoId,
      at: new Date().toISOString(),
      visitorType: "visitor",
      userAgent: input.userAgent?.slice(0, 300) || undefined,
      referer: input.referer?.slice(0, 500) || undefined,
      ipHash,
      humanConfirmed: false,
      events: [],
    };
    data.visits.push(visit);
  }

  if (!visit.events.includes(input.event)) {
    visit.events.push(input.event);
  }

  if (input.event === "human_confirm") {
    visit.humanConfirmed = true;
  }

  visit.visitorType = resolveVisitorType({
    isAdmin: Boolean(input.isAdmin),
    isLoggedIn: Boolean(input.isLoggedIn),
    userAgent: input.userAgent ?? visit.userAgent,
    humanConfirmed: visit.humanConfirmed,
  });

  writeAnalytics(data);
}

export type StorePreviewStats = {
  pageviews: { admin: number; visitor: number; bot: number };
  previewPlays: number;
  buyClicks: number;
  recent: StorePreviewVisit[];
};

export function getStorePreviewStats(videoId: string, recentLimit = 8): StorePreviewStats {
  const visits = readAnalytics().visits.filter((v) => v.videoId === videoId);
  const stats: StorePreviewStats = {
    pageviews: { admin: 0, visitor: 0, bot: 0 },
    previewPlays: 0,
    buyClicks: 0,
    recent: visits.slice(-recentLimit).reverse(),
  };

  for (const visit of visits) {
    if (visit.events.includes("pageview")) {
      stats.pageviews[visit.visitorType] += 1;
    }
    if (visit.events.includes("preview_play")) stats.previewPlays += 1;
    if (visit.events.includes("buy_click")) stats.buyClicks += 1;
  }

  return stats;
}
