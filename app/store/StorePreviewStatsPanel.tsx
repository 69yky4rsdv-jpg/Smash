"use client";

import { useCallback, useEffect, useState } from "react";
import type { StorePreviewStats } from "@/lib/store-preview-analytics";

type Props = {
  videoId: string;
  compact?: boolean;
};

export function StorePreviewStatsPanel({ videoId, compact = false }: Props) {
  const [stats, setStats] = useState<StorePreviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/store/preview-analytics?videoId=${encodeURIComponent(videoId)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { stats?: StorePreviewStats };
      if (data.stats) setStats(data.stats);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    function onRefresh(event: Event) {
      const detail = (event as CustomEvent<{ videoId?: string }>).detail;
      if (!detail?.videoId || detail.videoId === videoId) {
        void loadStats();
      }
    }
    window.addEventListener("store-preview-stats-refresh", onRefresh);
    return () => window.removeEventListener("store-preview-stats-refresh", onRefresh);
  }, [videoId, loadStats]);

  if (loading && !stats) {
    return (
      <p className="text-[11px] text-amber-100/70">
        {compact ? "Loading preview stats…" : "Loading analytics…"}
      </p>
    );
  }

  if (!stats) return null;

  if (compact) {
    return (
      <p className="text-[11px] text-amber-100/90">
        Preview traffic — You: {stats.pageviews.admin} · Visitors: {stats.pageviews.visitor} · Bots:{" "}
        {stats.pageviews.bot} · Plays: {stats.previewPlays} · Buy clicks: {stats.buyClicks}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-200">Preview analytics</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-center">
        <div className="rounded-lg border border-white/10 bg-black/30 px-2 py-2">
          <p className="text-lg font-semibold text-white">{stats.pageviews.admin}</p>
          <p className="text-[10px] text-neutral-400">You</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/30 px-2 py-2">
          <p className="text-lg font-semibold text-emerald-300">{stats.pageviews.visitor}</p>
          <p className="text-[10px] text-neutral-400">Visitors</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/30 px-2 py-2">
          <p className="text-lg font-semibold text-neutral-400">{stats.pageviews.bot}</p>
          <p className="text-[10px] text-neutral-400">Bots</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/30 px-2 py-2">
          <p className="text-lg font-semibold text-pink-200">{stats.previewPlays}</p>
          <p className="text-[10px] text-neutral-400">Preview plays</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/30 px-2 py-2">
          <p className="text-lg font-semibold text-pink-200">{stats.buyClicks}</p>
          <p className="text-[10px] text-neutral-400">Buy clicks</p>
        </div>
      </div>
      <p className="text-[10px] text-neutral-500">
        Updates live when you play the preview. Visitors = real browsers; bots = known crawlers only.
      </p>
    </div>
  );
}
