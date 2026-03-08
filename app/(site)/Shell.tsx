"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useSiteSettings } from "./SiteSettingsProvider";

export default function SiteShell({
  children,
}: {
  children: ReactNode;
}) {
  const { siteName, logoUrl } = useSiteSettings();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const raw = document.cookie ?? "";
    const hasUser = raw.includes("vs_userId=");
    const roleMatch = raw.match(/vs_role=([^;]+)/);
    const role = roleMatch ? decodeURIComponent(roleMatch[1]) : "";
    setIsLoggedIn(hasUser);
    setIsAdmin(role === "admin");
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Link
              href={isLoggedIn ? "/profile" : "/"}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-pink-400/30 to-pink-500/30 text-pink-200 transition hover:from-pink-400/50 hover:to-pink-500/50 hover:text-pink-100"
              aria-label={isLoggedIn ? "Profile" : "Home"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="8" r="3" />
                <path d="M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
              </svg>
            </Link>
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-200">
              <span className="bg-gradient-to-r from-accent-pink via-accent-pinkSoft to-pink-300 bg-clip-text text-transparent drop-shadow-sm">
                {siteName}
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            <Link
              href="/pricing"
              className="rounded-lg px-3 py-2 font-medium uppercase tracking-wider text-neutral-300 transition hover:bg-white/10 hover:text-pink-300 hover:shadow-[0_0_20px_rgba(251,207,232,0.25)]"
            >
              Pricing
            </Link>
            <Link
              href="/models"
              className="rounded-lg px-3 py-2 font-medium uppercase tracking-wider text-neutral-300 transition hover:bg-white/10 hover:text-pink-300 hover:shadow-[0_0_20px_rgba(251,207,232,0.25)]"
            >
              Models
            </Link>
            <Link
              href="/categories"
              className="rounded-lg px-3 py-2 font-medium uppercase tracking-wider text-neutral-300 transition hover:bg-white/10 hover:text-pink-300 hover:shadow-[0_0_20px_rgba(251,207,232,0.25)]"
            >
              Categories
            </Link>
            <Link
              href="/videos"
              className="rounded-lg px-3 py-2 font-medium uppercase tracking-wider text-neutral-300 transition hover:bg-white/10 hover:text-pink-300 hover:shadow-[0_0_20px_rgba(251,207,232,0.25)]"
            >
              Videos
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-lg px-3 py-2 font-medium uppercase tracking-wider text-pink-300 transition hover:bg-pink-500/20 hover:text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
              >
                Admin
              </Link>
            )}
            {isLoggedIn ? (
              <Link
                href="/auth/logout"
                className="btn-gradient ml-2 text-xs px-4 py-1.5"
              >
                Logout
              </Link>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="rounded-lg border border-white/30 px-4 py-1.5 text-xs font-medium text-neutral-100 hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-gradient text-xs px-4 py-1.5"
                >
                  Join
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-gradient-to-b from-black via-background to-black">
        {children}
      </main>
      <footer className="border-t border-white/5 bg-black/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-neutral-500">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="text-neutral-400 hover:text-neutral-200">
                Privacy
              </Link>
              <Link href="/terms" className="text-neutral-400 hover:text-neutral-200">
                Terms
              </Link>
              <Link href="/support" className="text-neutral-400 hover:text-neutral-200">
                Support
              </Link>
                  <Link href="/2257" className="text-neutral-400 hover:text-neutral-200">
                    2257
                  </Link>
            </div>
          </div>
          <p className="text-[10px] leading-snug text-neutral-500">
            18 U.S.C. § 2257 Record-Keeping Requirements Compliance Statement: All models appearing
            on this website are 18 years of age or older at the time of production. Records required
            pursuant to 18 U.S.C. § 2257 and 28 C.F.R. 75 are maintained by the custodian of records
            and are available upon request.
          </p>
        </div>
      </footer>
    </div>
  );
}

