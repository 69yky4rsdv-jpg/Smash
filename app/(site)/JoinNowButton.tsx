"use client";

import Link from "next/link";

export function JoinNowButton() {
  return (
    <Link
      href="/pricing"
      className="mt-6 inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-lg bg-gradient-to-r from-pink-400 via-accent-pinkSoft to-pink-300 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-pink-400/25 transition hover:scale-[1.02] hover:shadow-pink-400/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:ring-offset-2 focus:ring-offset-black sm:px-10 sm:text-lg"
    >
      Join now
    </Link>
  );
}

