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

export function CategoriesGate({ categories, videos }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof document === "undefined") return;
    const raw = document.cookie ?? "";
    const match = raw.match(/vs_userId=([^;]+)/);
    setIsLoggedIn(!!match);
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
