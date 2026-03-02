"use client";

import { AgeGate } from "../../(site)/AgeGate";
import { FormEvent, useState } from "react";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const user = await loginAction(formData);
      // Set simple client-side cookies used by header + server session.
      document.cookie = `vs_userId=${encodeURIComponent(user.id)}; path=/`;
      document.cookie = `vs_role=${encodeURIComponent(user.role)}; path=/`;
      window.location.href = "/";
    } catch (err: any) {
      const code = err?.message ?? "";
      if (code === "missing") {
        setError("Email and password are required.");
      } else {
        setError("Invalid email or password.");
      }
      setLoading(false);
    }
  }

  return (
    <AgeGate>
      <div className="mx-auto flex max-w-md flex-col px-4 py-10">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Login</h1>
        <p className="mb-6 text-sm text-neutral-300">
          Sign in to access members-only scenes.
        </p>

        {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

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
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-gradient flex w-full justify-center text-sm disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </AgeGate>
  );
}


