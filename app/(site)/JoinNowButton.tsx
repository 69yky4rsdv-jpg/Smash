"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MeResponse = {
  isLoggedIn: boolean;
  hasSubscription: boolean;
};

export function JoinNowButton() {
  const [state, setState] = useState<"loading" | "anon" | "no-sub" | "has-sub">("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Short-circuit for admin cookie in the browser.
      if (typeof document !== "undefined") {
        const raw = document.cookie ?? "";
        const match = raw.match(/vs_userId=([^;]+)/);
        const userId = match ? decodeURIComponent(match[1]) : null;
        if (userId === "admin") {
          setState("has-sub");
          return;
        }
      }

      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          throw new Error("Failed to load session");
        }
        const data = (await res.json()) as MeResponse;
        if (cancelled) return;

        if (!data.isLoggedIn) {
          setState("anon");
        } else if (!data.hasSubscription) {
          setState("no-sub");
        } else {
          setState("has-sub");
        }
      } catch {
        if (!cancelled) {
          setState("anon");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // While loading, behave like anon (send them to register) so the button is still usable.
  const effectiveState = state === "loading" ? "anon" : state;

  let href = "/auth/register";
  let label = "Join now";
  if (effectiveState === "no-sub") {
    href = "/pricing";
    label = "View plans";
  } else if (effectiveState === "has-sub") {
    href = "/videos";
    label = "Continue watching";
  }

  return (
    <Link
      href={href}
      className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-accent-pink via-accent-pinkSoft to-pink-400 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-pink-500/25 transition hover:scale-[1.02] hover:shadow-pink-500/40 focus:outline-none focus:ring-2 focus:ring-accent-pink/50 focus:ring-offset-2 focus:ring-offset-black"
    >
      {label}
    </Link>
  );
}

