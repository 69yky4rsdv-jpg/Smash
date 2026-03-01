"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "vs_age_confirmed";

export function AgeGate({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const value =
      typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (value === "true") {
      setOpen(false);
    }
  }, []);

  const confirm = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const exit = () => {
    window.location.href = "https://www.google.com";
  };

  if (!open) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="card-surface w-full max-w-md p-8 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight">
          Adult Content <span className="text-accent-pink">18+</span>
        </h1>
        <p className="mb-6 text-sm text-neutral-300">
          This site hosts explicit adult material. You must be at least 18 years old (or the age of
          majority in your jurisdiction) to continue.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={confirm} className="btn-gradient w-full">
            I am 18 or older
          </button>
          <button
            onClick={exit}
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-white/10"
          >
            I am under 18
          </button>
        </div>
      </div>
    </div>
  );
}
