"use client";

import type { Video } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MeResponse = {
  isLoggedIn: boolean;
  hasSubscription: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

type Props = {
  videos: Video[];
};

type Tab = "settings" | "saved" | "liked";

function getStoredIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function ProfileClient({ videos }: Props) {
  const [tab, setTab] = useState<Tab>("settings");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [meRes] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include" })
        ]);
        if (!meRes.ok) throw new Error("Failed to load session");
        const meJson = (await meRes.json()) as MeResponse;
        if (cancelled) return;
        setMe(meJson);
      } catch {
        if (!cancelled) {
          setMe({ isLoggedIn: false, hasSubscription: false });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function loadLocal() {
      setLikedIds(getStoredIds("vs-liked-videos"));
      setSavedIds(getStoredIds("vs-saved-videos"));
    }

    load();
    loadLocal();

    return () => {
      cancelled = true;
    };
  }, []);

  const likedVideos = useMemo(
    () => videos.filter((v) => likedIds.includes(v.id)),
    [videos, likedIds]
  );
  const savedVideos = useMemo(
    () => videos.filter((v) => savedIds.includes(v.id)),
    [videos, savedIds]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-neutral-300">
        Loading your profile…
      </div>
    );
  }

  if (!me?.isLoggedIn) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-2xl font-semibold text-neutral-50">Your profile</h1>
        <p className="text-sm text-neutral-300">
          Log in to view your profile, account settings, and saved videos.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link href="/auth/login" className="btn-gradient px-6 py-2">
            Login
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full border border-white/20 px-5 py-2 text-xs text-neutral-200 hover:bg-white/10"
          >
            Join now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-pink" />
          <div>
            <h1 className="text-xl font-semibold text-neutral-50">Your profile</h1>
            <p className="text-xs text-neutral-400">
              {me.user?.email} · {me.user?.role === "admin" ? "Admin" : "Member"}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setTab("settings")}
          className={`rounded-full px-3 py-1.5 ${
            tab === "settings"
              ? "bg-accent-pink text-white"
              : "bg-white/5 text-neutral-200 hover:bg-white/10"
          }`}
        >
          Settings
        </button>
        <button
          type="button"
          onClick={() => setTab("saved")}
          className={`rounded-full px-3 py-1.5 ${
            tab === "saved"
              ? "bg-accent-pink text-white"
              : "bg-white/5 text-neutral-200 hover:bg-white/10"
          }`}
        >
          Saved videos
        </button>
        <button
          type="button"
          onClick={() => setTab("liked")}
          className={`rounded-full px-3 py-1.5 ${
            tab === "liked"
              ? "bg-accent-pink text-white"
              : "bg-white/5 text-neutral-200 hover:bg-white/10"
          }`}
        >
          Liked videos
        </button>
      </div>

      {tab === "settings" && (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
          <h2 className="text-sm font-semibold text-neutral-100">Account settings</h2>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-neutral-400">Email</p>
              <p className="text-sm text-neutral-100">{me.user?.email}</p>
            </div>
            <p className="text-xs text-neutral-500">
              For now, account details are managed by support. Reach out via the support page if you
              need to change your email or password.
            </p>
          </div>
        </section>
      )}

      {tab === "saved" && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-100">Saved for later</h2>
          {savedVideos.length === 0 ? (
            <p className="text-xs text-neutral-500">
              You haven&apos;t saved any videos yet. Tap &quot;Save for later&quot; on a scene to
              add it here.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedVideos.map((video) => (
                <Link key={video.id} href={`/videos/${video.id}`} className="group">
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-tr from-pink-500/30 via-black to-pink-700/40" />
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-neutral-100 line-clamp-2 group-hover:text-accent-pinkSoft">
                    {video.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "liked" && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-100">Liked videos</h2>
          {likedVideos.length === 0 ? (
            <p className="text-xs text-neutral-500">
              You haven&apos;t liked any videos yet. Tap the heart on a scene to add it here.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {likedVideos.map((video) => (
                <Link key={video.id} href={`/videos/${video.id}`} className="group">
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-tr from-pink-500/30 via-black to-pink-700/40" />
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-neutral-100 line-clamp-2 group-hover:text-accent-pinkSoft">
                    {video.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

