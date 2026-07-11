"use client";

import type { Video } from "@/lib/types";
import type { VideoEngagement } from "@/lib/video-engagement";
import { VideoCardWithPreview } from "../VideoCardWithPreview";

type Props = {
  videos: Video[];
  engagementByVideoId?: Record<string, VideoEngagement>;
};

export function TrendingGridClient({ videos, engagementByVideoId = {} }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <div key={video.id} className="card-surface overflow-hidden">
          <VideoCardWithPreview
            video={video}
            engagement={engagementByVideoId[video.id]}
            thumbClassName="aspect-video w-full overflow-hidden bg-neutral-900"
            titleClassName="p-3 text-sm font-semibold line-clamp-2 group-hover:text-accent-pinkSoft"
            dateClassName="px-3 pb-3 text-[11px] text-neutral-400"
          />
        </div>
      ))}
    </div>
  );
}
