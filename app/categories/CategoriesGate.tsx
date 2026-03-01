"use client";

import type { Category } from "@/lib/types";
import type { Video } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CategoriesClient } from "./CategoriesClient";

type Props = {
  categories: Category[];
  videos: Video[];
};

type MeResponse = { isLoggedIn: boolean; user?: { role?: string } };

export function CategoriesGate({ categories, videos }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    async function check() {
      // Short-circuit for admin: cookie vs_userId "admin" means logged in even if API fails
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
  }, []);

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
