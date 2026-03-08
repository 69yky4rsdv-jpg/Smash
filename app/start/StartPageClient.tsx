"use client";

import { useState } from "react";

type Props = {
  saveEmailAction: (formData: FormData) => Promise<void>;
};

export function StartPageClient({ saveEmailAction }: Props) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    await saveEmailAction(formData);
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
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
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-neutral-500 focus:border-pink-400/50 focus:outline-none focus:ring-2 focus:ring-pink-400/30 disabled:opacity-60"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-full bg-green-500 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-60"
      >
        {loading ? "..." : "Continue"}
      </button>
    </form>
  );
}
