import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteSettingsProvider } from "./(site)/SiteSettingsProvider";
import SiteShell from "./(site)/Shell";

export const metadata: Metadata = {
  title: "SmashPov — Premium Porn Site",
  description: "Subscription-based premium video platform with models, categories, and affiliates."
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const site = getSiteSettings();
  return (
    <html lang="en" className="bg-background">
      <body className="min-h-screen bg-gradient-to-b from-black via-background to-black text-foreground antialiased">
        <SiteSettingsProvider siteName={site.siteName} logoUrl={site.logoUrl}>
          <SiteShell>
            {children}
          </SiteShell>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}

