import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ReactNode } from "react";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteSettingsProvider } from "./(site)/SiteSettingsProvider";
import { ConditionalShell } from "./(site)/ConditionalShell";
import { AgeGate } from "./(site)/AgeGate";

export const metadata: Metadata = {
  title: "SmashPov — Premium Porn Site",
  description: "Subscription-based premium video platform with models, categories, and affiliates.",
  icons: {
    icon: "https://Pull-Video-Load.b-cdn.net/logo/SP.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const site = getSiteSettings();
  const cookieStore = await cookies();
  const agePassed = cookieStore.get("vs_age")?.value === "1";
  return (
    <html lang="en" className="bg-background">
      <body className="min-h-screen bg-gradient-to-b from-black via-background to-black text-foreground antialiased">
        <SiteSettingsProvider siteName={site.siteName} logoUrl={site.logoUrl}>
          <AgeGate initialPassed={agePassed}>
          <ConditionalShell>{children}</ConditionalShell>
        </AgeGate>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}

