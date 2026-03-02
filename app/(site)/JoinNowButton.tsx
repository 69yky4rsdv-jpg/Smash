"use client";

import Link from "next/link";

export function JoinNowButton() {
  return (
    <Link
      href="/pricing"
      className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-accent-pink via-accent-pinkSoft to-pink-400 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-pink-500/25 transition hover:scale-[1.02] hover:shadow-pink-500/40 focus:outline-none focus:ring-2 focus:ring-accent-pink/50 focus:ring-offset-2 focus:ring-offset-black"
    >
      Join now
    </Link>
  );
}

