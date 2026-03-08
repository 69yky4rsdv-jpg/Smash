"use client";

import type { ReactNode } from "react";
import { useState } from "react";

const STORAGE_KEY = "vs_age_confirmed";
const COOKIE_NAME = "vs_age";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export function AgeGate({
  children,
  initialPassed
}: {
  children: ReactNode;
  initialPassed?: boolean;
}) {
  const [open, setOpen] = useState(!initialPassed);

  const confirm = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    setOpen(false);
  };

  const exit = () => {
    window.location.href = "https://www.google.com";
  };

  if (!open) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="card-surface w-full max-w-md p-6 text-center sm:p-8">
        <h1 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-3xl">
          Adult Content <span className="text-accent-pink">18+</span>
        </h1>
        <p className="mb-5 text-sm text-neutral-300 sm:mb-6">
          This site hosts explicit adult material. You must be at least 18 years old (or the age of
          majority in your jurisdiction) to continue.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={confirm} className="btn-gradient min-h-[48px] w-full">
            I am 18 or older
          </button>
          <button
            onClick={exit}
            className="min-h-[48px] w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-200 transition hover:bg-white/10"
          >
            I am under 18
          </button>
        </div>
      </div>
    </div>
  );
}
