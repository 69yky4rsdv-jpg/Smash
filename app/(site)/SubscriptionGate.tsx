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
  /** When true, server already verified access (cookie + user lookup). Skip blocking. */
  initialHasAccess?: boolean;
  /** When true, admin bypass — render children immediately, no gate. */
  skipGate?: boolean;
};

function isAdminCookie(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie?.match(/vs_userId=([^;]+)/);
  return match ? decodeURIComponent(match[1].trim()) === "admin" : false;
}

export function SubscriptionGate({ children, initialHasAccess = false, skipGate = false }: Props) {
  if (skipGate) return <>{children}</>;

  const [state, setState] = useState<"loading" | "no-auth" | "no-sub" | "ok">(() =>
    initialHasAccess || isAdminCookie() ? "ok" : "loading"
  );

  useEffect(() => {
    if (initialHasAccess) return;
    let cancelled = false;

    async function check() {
      // Short-circuit for admin: if the cookie userId is "admin", always allow.
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
        const res = await fetch("/api/auth/me", {
          credentials: "include"
        });
        if (!res.ok) {
          throw new Error("Failed to load session");
        }
        const data = (await res.json()) as MeResponse;
        if (cancelled) return;

        const isAdmin = data.user?.role === "admin";
        if (!data.isLoggedIn) {
          setState("no-auth");
        } else if (data.hasSubscription || isAdmin) {
          setState("ok");
        } else {
          setState("no-sub");
        }
      } catch {
        if (!cancelled) {
          if (typeof document !== "undefined") {
            const raw = document.cookie ?? "";
            const match = raw.match(/vs_userId=([^;]+)/);
            const userId = match ? decodeURIComponent(match[1].trim()) : null;
            if (userId === "admin") {
              setState("ok");
              return;
            }
          }
          setState("no-auth");
        }
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, [initialHasAccess]);

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
        <h2 className="text-lg font-semibold text-neutral-100">Log in to watch scenes</h2>
        <p className="text-sm text-neutral-300">
          You need an account and an active membership to stream the full scenes.
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

  if (state === "no-sub") {
    return (
      <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-accent-pink/40 bg-gradient-to-b from-accent-pink/10 via-black/60 to-black p-8 text-center">
        <h2 className="text-lg font-semibold text-neutral-100">Unlock this scene</h2>
        <p className="text-sm text-neutral-300">
          Get instant access to this scene and the full SmashPOV library with any membership plan.
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

  return <>{children}</>;
}

