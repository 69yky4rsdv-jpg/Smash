import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { getDataDir } from "./data";

/** Overrides for how a plan is displayed on the start plan page (name, price, billing label). */
export type PlanDisplayOverride = {
  name?: string;
  pricePerMonth?: number;
  billingLabel?: string;
};

export type SiteSettings = {
  siteName: string;
  logoUrl?: string;
  heroBannerLine1: string;
  heroBannerLine2: string;
  heroBannerImageUrl?: string;
  /** When true, male performers are hidden on the public /models page. */
  hideMalePerformersOnModelsPage?: boolean;
  /** Start page (/start): left and right vertical hero images. */
  startPageLeftHeroUrl?: string;
  startPageRightHeroUrl?: string;
  /** Start page: bottom 4 content block image URLs (order: 1–4). */
  startPageBottomImageUrls?: string[];
  /** Start plan page: sticker text for the 7-day trial card (e.g. "Free 7 days"). */
  freeTrialStickerText?: string;
  /** Start plan page: display overrides per plan id (weekly, monthly). */
  planDisplayOverrides?: Record<string, PlanDisplayOverride>;
};

const DEFAULT: SiteSettings = {
  siteName: "VelvetStream",
  logoUrl: undefined,
  heroBannerLine1: "A fan favorite.",
  heroBannerLine2: "Take it all in.",
  heroBannerImageUrl: "https://picsum.photos/1600/400?blur=2",
  hideMalePerformersOnModelsPage: false,
  startPageLeftHeroUrl: undefined,
  startPageRightHeroUrl: undefined,
  startPageBottomImageUrls: undefined,
  freeTrialStickerText: undefined,
  planDisplayOverrides: undefined
};

function getFilePath(): string {
  return join(getDataDir(), "site.json");
}

export function getSiteSettings(): SiteSettings {
  try {
    const path = getFilePath();
    if (!existsSync(path)) return { ...DEFAULT };
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as Partial<SiteSettings>;
    const bottomUrls = data.startPageBottomImageUrls;
    return {
      siteName: data.siteName ?? DEFAULT.siteName,
      logoUrl: data.logoUrl ?? DEFAULT.logoUrl,
      heroBannerLine1: data.heroBannerLine1 ?? DEFAULT.heroBannerLine1,
      heroBannerLine2: data.heroBannerLine2 ?? DEFAULT.heroBannerLine2,
      heroBannerImageUrl: data.heroBannerImageUrl ?? DEFAULT.heroBannerImageUrl,
      hideMalePerformersOnModelsPage: Boolean(data.hideMalePerformersOnModelsPage ?? DEFAULT.hideMalePerformersOnModelsPage),
    startPageLeftHeroUrl: data.startPageLeftHeroUrl ?? DEFAULT.startPageLeftHeroUrl,
    startPageRightHeroUrl: data.startPageRightHeroUrl ?? DEFAULT.startPageRightHeroUrl,
    startPageBottomImageUrls: Array.isArray(bottomUrls) ? bottomUrls.slice(0, 4) : DEFAULT.startPageBottomImageUrls,
    freeTrialStickerText: data.freeTrialStickerText ?? DEFAULT.freeTrialStickerText,
    planDisplayOverrides: data.planDisplayOverrides && typeof data.planDisplayOverrides === "object" ? data.planDisplayOverrides : DEFAULT.planDisplayOverrides
  };
  } catch {
    return { ...DEFAULT };
  }
}

export function setSiteSettings(updates: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const next: SiteSettings = {
    siteName: updates.siteName ?? current.siteName,
    logoUrl: updates.logoUrl !== undefined ? updates.logoUrl : current.logoUrl,
    heroBannerLine1: updates.heroBannerLine1 ?? current.heroBannerLine1,
    heroBannerLine2: updates.heroBannerLine2 ?? current.heroBannerLine2,
    heroBannerImageUrl: updates.heroBannerImageUrl !== undefined ? updates.heroBannerImageUrl : current.heroBannerImageUrl,
    hideMalePerformersOnModelsPage: updates.hideMalePerformersOnModelsPage !== undefined ? updates.hideMalePerformersOnModelsPage : current.hideMalePerformersOnModelsPage,
    startPageLeftHeroUrl: updates.startPageLeftHeroUrl !== undefined ? updates.startPageLeftHeroUrl : current.startPageLeftHeroUrl,
    startPageRightHeroUrl: updates.startPageRightHeroUrl !== undefined ? updates.startPageRightHeroUrl : current.startPageRightHeroUrl,
    startPageBottomImageUrls: updates.startPageBottomImageUrls !== undefined ? updates.startPageBottomImageUrls.slice(0, 4) : current.startPageBottomImageUrls,
    freeTrialStickerText: updates.freeTrialStickerText !== undefined ? updates.freeTrialStickerText : current.freeTrialStickerText,
    planDisplayOverrides: updates.planDisplayOverrides !== undefined ? updates.planDisplayOverrides : current.planDisplayOverrides
  };
  try {
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(getFilePath(), JSON.stringify(next, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write site.json:", e);
  }
  return next;
}
