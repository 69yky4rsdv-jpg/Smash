"use client";

import Link from "next/link";

export function JoinNowButton() {
  return (
    <Link
      href="/pricing"
      className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-pink-400 via-accent-pinkSoft to-pink-300 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-pink-400/25 transition hover:scale-[1.02] hover:shadow-pink-400/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:ring-offset-2 focus:ring-offset-black"
    >
      Join now
    </Link>
  );
}

