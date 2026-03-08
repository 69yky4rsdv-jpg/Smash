import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { getDataDir } from "./data";

export type SiteSettings = {
  siteName: string;
  logoUrl?: string;
  heroBannerLine1: string;
  heroBannerLine2: string;
  heroBannerImageUrl?: string;
  /** When true, male performers are hidden on the public /models page. */
  hideMalePerformersOnModelsPage?: boolean;
};

const DEFAULT: SiteSettings = {
  siteName: "VelvetStream",
  logoUrl: undefined,
  heroBannerLine1: "A fan favorite.",
  heroBannerLine2: "Take it all in.",
  heroBannerImageUrl: "https://picsum.photos/1600/400?blur=2",
  hideMalePerformersOnModelsPage: false
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
    return {
      siteName: data.siteName ?? DEFAULT.siteName,
      logoUrl: data.logoUrl ?? DEFAULT.logoUrl,
      heroBannerLine1: data.heroBannerLine1 ?? DEFAULT.heroBannerLine1,
      heroBannerLine2: data.heroBannerLine2 ?? DEFAULT.heroBannerLine2,
      heroBannerImageUrl: data.heroBannerImageUrl ?? DEFAULT.heroBannerImageUrl,
      hideMalePerformersOnModelsPage: Boolean(data.hideMalePerformersOnModelsPage ?? DEFAULT.hideMalePerformersOnModelsPage)
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
    hideMalePerformersOnModelsPage: updates.hideMalePerformersOnModelsPage !== undefined ? updates.hideMalePerformersOnModelsPage : current.hideMalePerformersOnModelsPage
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
