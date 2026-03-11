"use client";

import { useState } from "react";

type Props = {
  saveEmailAction: (formData: FormData) => Promise<{ error?: string } | void>;
};

export function StartPageClient({ saveEmailAction }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const rawEmail = String(formData.get("email") ?? "").trim();
    // Stricter client-side email check before hitting the server:
    // - Only typical email characters before @
    // - Domain with at least one dot
    // - TLD at least 2 letters
    const strictEmailPattern = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!strictEmailPattern.test(rawEmail)) {
      setLoading(false);
      setError("Please enter a valid email address.");
      return;
    }
    try {
      const result = await saveEmailAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <div className="space-y-1">
        <label htmlFor="start-email" className="text-sm text-neutral-200">
          Email
        </label>
        <input
          id="start-email"
          name="email"
          type="email"
          required
          placeholder="Enter your email"
          disabled={loading}
          autoComplete="email"
          inputMode="email"
          className="w-full min-h-[48px] rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder:text-neutral-500 focus:border-pink-400/50 focus:outline-none focus:ring-2 focus:ring-pink-400/30 disabled:opacity-60"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full min-h-[48px] items-center justify-center rounded-full bg-green-500 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-60"
      >
        {loading ? "..." : "Continue"}
      </button>
    </form>
  );
}
