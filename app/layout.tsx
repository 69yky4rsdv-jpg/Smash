import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { getSiteSettings } from "@/lib/site-settings";
import { getUsers } from "@/lib/data";
import { SiteSettingsProvider } from "./(site)/SiteSettingsProvider";
import SiteShell from "./(site)/Shell";

export const metadata: Metadata = {
  title: "SmashPov — Premium Porn Site",
  description: "Subscription-based premium video platform with models, categories, and affiliates."
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const site = getSiteSettings();
  const cookieStore = await cookies();
  const userId = (cookieStore.get("vs_userId")?.value ?? "").trim();
  const user = userId ? getUsers().find((u) => u.id === userId) : null;
  const initialIsLoggedIn = !!userId || !!user;
  const initialIsAdmin = user?.role === "admin" || userId === "admin";
  return (
    <html lang="en" className="bg-background">
      <body className="min-h-screen bg-gradient-to-b from-black via-background to-black text-foreground antialiased">
        <SiteSettingsProvider siteName={site.siteName} logoUrl={site.logoUrl}>
          <SiteShell initialIsLoggedIn={initialIsLoggedIn} initialIsAdmin={initialIsAdmin}>
            {children}
          </SiteShell>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}

