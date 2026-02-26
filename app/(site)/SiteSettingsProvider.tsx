"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

export type SiteSettings = {
  siteName: string;
  logoUrl?: string;
};

const SiteSettingsContext = createContext<SiteSettings>({
  siteName: "VelvetStream",
  logoUrl: undefined
});

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export function SiteSettingsProvider({
  children,
  siteName,
  logoUrl
}: {
  children: ReactNode;
  siteName: string;
  logoUrl?: string;
}) {
  return (
    <SiteSettingsContext.Provider value={{ siteName, logoUrl }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
