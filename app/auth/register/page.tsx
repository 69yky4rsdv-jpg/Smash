"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import SiteShell from "../../(site)/Shell";
import { AgeGate } from "../../(site)/AgeGate";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Unable to create account.");
      setLoading(false);
      return;
    }

    window.location.href = "/pricing";
  }

  return (
    <AgeGate>
      <SiteShell>
        <div className="mx-auto flex max-w-md flex-col px-4 py-10">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">
            Join <span className="text-accent-pink">VelvetStream</span>
          </h1>
          <p className="mb-6 text-sm text-neutral-300">
            Create your account in seconds. Choose a membership on the next step.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
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
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient flex w-full justify-center text-sm disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Continue"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-neutral-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent-pink hover:text-accent-pinkSoft">
              Log in
            </Link>
          </p>
        </div>
      </SiteShell>
    </AgeGate>
  );
}

