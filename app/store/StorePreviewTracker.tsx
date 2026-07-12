"use client";

import { useEffect, useRef } from "react";

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
      await fetch("/api/store/preview-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          event,
          visitId: visitRef.current,
        }),
        keepalive: event === "buy_click",
      });
    } catch {
      // Non-blocking analytics
    }
  }

  return { trackPreviewPlay: () => track("preview_play"), trackBuyClick: () => track("buy_click") };
}

export function StorePreviewTracker({ videoId, visitId }: Props) {
  const { trackPreviewPlay } = useStorePreviewAnalytics(videoId, visitId);

  useEffect(() => {
    void fetch("/api/store/preview-analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, event: "human_confirm", visitId }),
    });
  }, [videoId, visitId]);

  return null;
}

export { StorePreviewTracker as default };
