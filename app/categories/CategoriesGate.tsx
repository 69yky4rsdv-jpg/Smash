"use client";

import type { Category } from "@/lib/types";
import type { Video } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CategoriesClient } from "./CategoriesClient";

type Props = {
  categories: Category[];
  videos: Video[];
  /** When true, server already verified user is logged in (cookie + user lookup). */
  initialLoggedIn?: boolean;
  /** When true, admin bypass — show categories immediately, no gate. */
  skipGate?: boolean;
};

type MeResponse = { isLoggedIn: boolean; user?: { role?: string } };

function isAdminCookie(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie?.match(/vs_userId=([^;]+)/);
  return match ? decodeURIComponent(match[1].trim()) === "admin" : false;
}

export function CategoriesGate({
  categories,
  videos,
  initialLoggedIn = false,
  skipGate = false
}: Props) {
  if (skipGate) return <CategoriesClient categories={categories} videos={videos} />;

  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (initialLoggedIn) {
      setMounted(true);
      return;
    }
    setMounted(true);
    let cancelled = false;
    async function check() {
      if (typeof document !== "undefined") {
        const raw = document.cookie ?? "";
        const match = raw.match(/vs_userId=([^;]+)/);
        const userId = match ? decodeURIComponent(match[1].trim()) : null;
        if (userId === "admin") {
          setIsLoggedIn(true);
          return;
        }
      }
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (cancelled) return;
        const data = (await res.json()) as MeResponse;
        setIsLoggedIn(!!data.isLoggedIn || data.user?.role === "admin");
      } catch {
        if (!cancelled) setIsLoggedIn(false);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [initialLoggedIn]);

  if (!mounted) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-neutral-400">
        Loading…
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-neutral-300">Log in or sign up to view categories.</p>
        <Link
          href="/auth/login"
          className="btn-gradient mt-4 inline-flex text-sm px-6 py-2"
        >
          Login / Join
        </Link>
      </div>
    );
  }

  return <CategoriesClient categories={categories} videos={videos} />;
}
