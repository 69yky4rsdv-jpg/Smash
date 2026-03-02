"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type MeResponse = {
  isLoggedIn: boolean;
  hasSubscription: boolean;
  user?: { role?: string };
};

type Props = {
  children: ReactNode;
  /** When true, server already verified access (cookie + user lookup). */
  initialHasAccess?: boolean;
  /** When true, admin bypass — render children immediately, no gate. */
  skipGate?: boolean;
};

export function SubscriptionGate({
  children,
  initialHasAccess = false,
  skipGate = false
}: Props) {
  const [state, setState] = useState<"loading" | "no-auth" | "no-sub" | "ok">(
    initialHasAccess ? "ok" : "loading"
  );

  useEffect(() => {
    if (skipGate || initialHasAccess) {
      setState("ok");
      return;
    }
    let cancelled = false;

    async function check() {
      // Client-side admin cookie fallback so admin always bypasses gate,
      // even if /api/auth/me cannot see the cookie on the server.
      if (typeof document !== "undefined") {
        const raw = document.cookie ?? "";
        const match = raw.match(/vs_userId=([^;]+)/);
        const userId = match ? decodeURIComponent(match[1].trim()) : null;
        if (userId === "admin") {
          setState("ok");
          return;
        }
      }

      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          throw new Error("Failed to load session");
        }
        const data = (await res.json()) as MeResponse;
        if (cancelled) return;

        const isAdmin = data.user?.role === "admin";
        if (!data.isLoggedIn) {
          // Not logged in: block content on gated pages. User can still view / and /pricing directly.
          setState("no-auth");
        } else if (data.hasSubscription || isAdmin) {
          // Subscription or admin: full access.
          setState("ok");
        } else {
          // Logged in but no subscription.
          setState("no-sub");
        }
      } catch {
        if (!cancelled) {
          setState("no-auth");
        }
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [initialHasAccess, skipGate]);

  if (skipGate) return <>{children}</>;
  if (state === "ok") return <>{children}</>;

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-neutral-300">
        Checking your membership…
      </div>
    );
  }

  if (state === "no-auth") {
    return (
      <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h2 className="text-lg font-semibold text-neutral-100">Log in to access this page</h2>
        <p className="text-sm text-neutral-300">
          Only the homepage and pricing are available when you are not logged in.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link href="/auth/login" className="btn-gradient px-6 py-2">
            Login / Join
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-white/20 px-5 py-2 text-xs text-neutral-200 hover:bg-white/10"
          >
            View membership plans
          </Link>
        </div>
      </div>
    );
  }

  // state === "no-sub"
  return (
    <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-accent-pink/40 bg-gradient-to-b from-accent-pink/10 via-black/60 to-black p-8 text-center">
      <h2 className="text-lg font-semibold text-neutral-100">Unlock this page</h2>
      <p className="text-sm text-neutral-300">
        Get instant access to all pages and scenes with any membership plan.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
        <Link href="/pricing" className="btn-gradient px-8 py-2">
          See membership options
        </Link>
      </div>
      <p className="text-[11px] text-neutral-400">
        Already subscribed? Log out and back in with the email tied to your membership.
      </p>
    </div>
  );
}
