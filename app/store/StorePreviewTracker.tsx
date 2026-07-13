"use client";

import { useEffect, useRef } from "react";
import { notifyStorePreviewStatsRefresh } from "./store-preview-stats-events";

type Props = {
  videoId: string;
  visitId?: string;
};

export function useStorePreviewAnalytics(videoId: string, visitId?: string) {
  const visitRef = useRef(visitId);

  useEffect(() => {
    visitRef.current = visitId;
  }, [visitId]);

  async function track(event: "human_confirm" | "preview_play" | "buy_click") {
    try {
      const res = await fetch("/api/store/preview-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          event,
          visitId: visitRef.current,
        }),
        keepalive: event === "buy_click",
      });
      if (res.ok) {
        notifyStorePreviewStatsRefresh(videoId);
      }
    } catch {
      // Non-blocking analytics
    }
  }

  return { trackPreviewPlay: () => track("preview_play"), trackBuyClick: () => track("buy_click") };
}

export function StorePreviewTracker({ videoId, visitId }: Props) {
  useEffect(() => {
    void fetch("/api/store/preview-analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, event: "human_confirm", visitId }),
    }).then((res) => {
      if (res.ok) notifyStorePreviewStatsRefresh(videoId);
    });
  }, [videoId, visitId]);

  return null;
}

export { StorePreviewTracker as default };
