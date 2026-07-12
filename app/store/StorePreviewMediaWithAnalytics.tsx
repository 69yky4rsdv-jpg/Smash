"use client";

import type { ComponentProps } from "react";
import { StorePreviewMedia } from "./StorePreviewMedia";
import { useStorePreviewAnalytics } from "./StorePreviewTracker";

type Props = ComponentProps<typeof StorePreviewMedia> & {
  videoId: string;
  visitId?: string;
};

export function StorePreviewMediaWithAnalytics({ videoId, visitId, ...props }: Props) {
  const { trackPreviewPlay, trackBuyClick } = useStorePreviewAnalytics(videoId, visitId);
  return (
    <StorePreviewMedia
      {...props}
      onPreviewPlay={trackPreviewPlay}
      onBuyClick={trackBuyClick}
    />
  );
}
