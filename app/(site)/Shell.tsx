"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useSiteSettings } from "./SiteSettingsProvider";

function readAuthFromCookies(): { isLoggedIn: boolean; isAdmin: boolean } {
  if (typeof document === "undefined") {
    return { isLoggedIn: false, isAdmin: false };
  }
  const raw = document.cookie ?? "";
  const userMatch = raw.match(/(?:^|;\s*)vs_userId=([^;]*)/);
  const roleMatch = raw.match(/(?:^|;\s*)vs_role=([^;]*)/);
  const userId = userMatch?.[1] ? decodeURIComponent(userMatch[1]).trim() : "";
  const role = roleMatch?.[1] ? decodeURIComponent(roleMatch[1]).trim() : "";
  return { isLoggedIn: Boolean(userId), isAdmin: role === "admin" };
}

export default function SiteShell({
  children,
  initialLoggedIn = false,
  initialIsAdmin = false,
}: {
  children: ReactNode;
  initialLoggedIn?: boolean;
  initialIsAdmin?: boolean;
}) {
  const { siteName, logoUrl } = useSiteSettings();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  useEffect(() => {
    const { isLoggedIn: loggedIn, isAdmin: admin } = readAuthFromCookies();
    setIsLoggedIn(loggedIn);
    setIsAdmin(admin);
  }, [pathname, initialLoggedIn, initialIsAdmin]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-xl pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-4 sm:py-4">
          <div className="flex min-h-[44px] items-center gap-2">
            <Link
              href={isLoggedIn ? "/profile" : "/"}
              className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-pink-300/20 text-pink-200 shadow-sm ring-1 ring-pink-300/40 transition hover:bg-pink-300/30 hover:text-pink-50 hover:ring-pink-200/80"
              aria-label={isLoggedIn ? "Profile" : "Home"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="8" r="3" />
                <path d="M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
              </svg>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-3 py-1 text-base font-bold uppercase tracking-[-0.03em] bg-black text-pink-200 border border-white sm:text-lg"
              style={{ fontFamily: '"Zing Rust", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            >
              <span
                className="inline-block"
                style={{ transform: "scaleX(1.12)", transformOrigin: "center" }}
              >
                {siteName}
              </span>
            </Link>
          </div>
          <nav className="flex flex-wrap items-center gap-1 text-sm sm:gap-2">
            <Link
              href="/pricing"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-300 transition hover:bg-white/10 hover:text-pink-300 hover:shadow-[0_0_20px_rgba(251,207,232,0.25)]"
            >
              Pricing
            </Link>
            <Link
              href="/models"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-300 transition hover:bg-white/10 hover:text-pink-300 hover:shadow-[0_0_20px_rgba(251,207,232,0.25)]"
            >
              Models
            </Link>
            <Link
              href="/categories"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-300 transition hover:bg-white/10 hover:text-pink-300 hover:shadow-[0_0_20px_rgba(251,207,232,0.25)]"
            >
              Categories
            </Link>
            <Link
              href="/videos"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-300 transition hover:bg-white/10 hover:text-pink-300 hover:shadow-[0_0_20px_rgba(251,207,232,0.25)]"
            >
              Videos
            </Link>
            <Link
              href="/store"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-300 transition hover:bg-white/10 hover:text-pink-300 hover:shadow-[0_0_20px_rgba(251,207,232,0.25)]"
            >
              Store
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2.5 font-medium uppercase tracking-wider text-pink-300 transition hover:bg-pink-500/20 hover:text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
              >
                Admin
              </Link>
            )}
            {isLoggedIn ? (
              <Link
                href="/auth/logout"
                className="btn-gradient ml-1 min-h-[44px] flex items-center px-4 py-2.5 text-xs sm:ml-2"
              >
                Logout
              </Link>
            ) : (
              <div className="ml-1 flex items-center gap-2 sm:ml-2">
                <Link
                  href="/auth/login"
                  className="min-h-[44px] flex items-center rounded-lg border border-white/30 px-4 py-2.5 text-xs font-medium text-neutral-100 hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-gradient flex min-h-[44px] items-center px-4 py-2.5 text-xs"
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
      <footer className="border-t border-white/5 bg-black/80 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]">
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

