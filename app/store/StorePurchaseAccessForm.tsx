"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { isRedirectError } from "@/lib/action-errors";
import { loginAfterStorePurchaseAction } from "./actions";

type Props = {
  videoId: string;
  videoTitle: string;
};

export function StorePurchaseAccessForm({ videoId, videoTitle }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("videoId", videoId);

    try {
      await loginAfterStorePurchaseAction(formData);
    } catch (err: unknown) {
      if (isRedirectError(err)) throw err;
      const code = err instanceof Error ? err.message : "";
      if (code === "missing") {
        setError("Email and password are required.");
      } else {
        setError("Invalid email or password. Use the same email you checked out with.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Payment received</p>
        <h1 className="text-2xl font-semibold text-white">Log in to watch</h1>
        <p className="text-sm text-neutral-400">
          Your purchase of <span className="text-neutral-200">{videoTitle}</span> is ready. Log in to
          unlock the full video instantly.
        </p>
      </header>

      {error ? <p className="text-center text-xs text-red-400">{error}</p> : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-1 text-sm">
          <label htmlFor="email" className="text-neutral-200">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="password" className="text-neutral-200">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-gradient w-full justify-center text-sm disabled:opacity-60">
          {loading ? "Signing in…" : "Log in & watch full video"}
        </button>
      </form>

      <p className="text-center text-xs text-neutral-500">
        First purchase?{" "}
        <Link href={`/store/${videoId}/signup?purchased=1`} className="text-accent-pink hover:text-accent-pinkSoft">
          Create free account
        </Link>
      </p>
    </div>
  );
}
