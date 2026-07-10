"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { registerStoreUserAction } from "./actions";

type Props = {
  videoId: string;
  videoTitle: string;
  price: string;
  checkoutUrl?: string;
};

export function StoreSignupForm({ videoId, videoTitle, price, checkoutUrl }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("videoId", videoId);

    try {
      await registerStoreUserAction(formData);
      const afterSignup = checkoutUrl?.trim() || `/store/${videoId}/checkout`;
      window.location.href = afterSignup;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "signup_failed";
      if (message === "missing") {
        setError("Email and password are required.");
      } else if (message === "exists") {
        setError("An account with that email already exists. Log in and return to complete your purchase.");
      } else {
        setError("Could not create your account. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-10">
      <header className="space-y-2 text-center">
        <Link href={`/store/${videoId}`} className="text-xs text-accent-pinkSoft hover:text-accent-pink">
          ← Back to preview
        </Link>
        <p className="text-xs uppercase tracking-[0.18em] text-accent-pinkSoft">Free account</p>
        <h1 className="text-2xl font-semibold text-white">Create account to buy</h1>
        <p className="text-sm text-neutral-400">
          Sign up for a free account — no membership required. Then complete your one-time purchase for{" "}
          <span className="text-neutral-200">{videoTitle}</span> ({price}).
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
            minLength={6}
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-gradient w-full justify-center text-sm disabled:opacity-60">
          {loading ? "Creating account…" : checkoutUrl ? "Continue to payment" : "Create free account"}
        </button>
      </form>

      <p className="text-center text-xs text-neutral-500">
        Already have an account?{" "}
        <Link href={`/auth/login?next=/store/${videoId}/checkout`} className="text-accent-pink hover:text-accent-pinkSoft">
          Log in
        </Link>
      </p>
    </div>
  );
}
