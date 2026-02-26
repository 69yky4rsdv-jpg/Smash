import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteSettingsProvider } from "./(site)/SiteSettingsProvider";

export const metadata: Metadata = {
  title: "VelvetStream — Premium Video Platform",
  description: "Subscription-based premium video platform with models, categories, and affiliates."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const site = getSiteSettings();
  return (
    <html lang="en" className="bg-background">
      <body className="min-h-screen bg-gradient-to-b from-black via-background to-black text-foreground antialiased">
        <SiteSettingsProvider siteName={site.siteName} logoUrl={site.logoUrl}>
          {children}
        </SiteSettingsProvider>
      </body>
    </html>
  );
}

