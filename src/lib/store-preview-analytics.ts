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

const BOT_UA_PATTERNS = [
  "bot",
  "crawl",
  "spider",
  "slurp",
  "mediapartners",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegram",
  "discordbot",
  "slackbot",
  "headless",
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
  "anthropic",
  "prerender",
  "preview",
  "ia_archiver",
  "applebot",
];

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.trim().length < 12) return true;
  const lower = userAgent.toLowerCase();
  return BOT_UA_PATTERNS.some((pattern) => lower.includes(pattern));
}

function resolveVisitorType(input: {
  isAdmin: boolean;
  userAgent?: string | null;
  humanConfirmed: boolean;
}): StorePreviewVisitorType {
  if (input.isAdmin) return "admin";
  if (input.humanConfirmed && !isBotUserAgent(input.userAgent)) return "visitor";
  if (isBotUserAgent(input.userAgent)) return "bot";
  return input.humanConfirmed ? "visitor" : "bot";
}

export function logStorePreviewPageView(input: {
  videoId: string;
  userAgent?: string | null;
  referer?: string | null;
  ip?: string | null;
  isAdmin: boolean;
}): string {
  const data = readAnalytics();
  const visit: StorePreviewVisit = {
    id: randomUUID(),
    videoId: input.videoId,
    at: new Date().toISOString(),
    visitorType: resolveVisitorType({
      isAdmin: input.isAdmin,
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
}): void {
  const data = readAnalytics();
  const ipHash = hashIp(input.ip);
  let visit = findRecentVisit(input.videoId, input.visitId, ipHash);

  if (!visit) {
    visit = {
      id: input.visitId || randomUUID(),
      videoId: input.videoId,
      at: new Date().toISOString(),
      visitorType: "bot",
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
