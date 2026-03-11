"use client";

import type { Video } from "@/lib/types";
import Link from "next/link";
import { VideoCardWithPreview } from "./videos/VideoCardWithPreview";

type Props = {
  latest: Video[];
  trending: Video[];
};

export function HomeVideoGrids({ latest, trending }: Props) {
  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold sm:text-xl">Featured</h2>
          <Link
            href="/videos"
            className="min-h-[44px] min-w-[44px] flex items-center text-xs text-accent-pinkSoft hover:text-accent-pink"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-6 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {latest.map((video) => (
            <VideoCardWithPreview
              key={video.id}
              video={video}
              titleClassName="mt-3 text-base font-medium text-neutral-100 line-clamp-2 group-hover:text-accent-pinkSoft"
              dateClassName="mt-1 text-sm text-neutral-500"
              thumbClassName="aspect-video w-full overflow-hidden rounded-xl bg-neutral-900"
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold sm:text-xl">Trending videos</h2>
          <Link
            href="/videos/trending"
            className="min-h-[44px] min-w-[44px] flex items-center text-xs text-accent-pinkSoft hover:text-accent-pink"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-6 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {trending.map((video) => (
            <VideoCardWithPreview
              key={video.id}
              video={video}
              titleClassName="mt-3 text-base font-medium text-neutral-100 line-clamp-2 group-hover:text-accent-pinkSoft"
              dateClassName="mt-1 text-sm text-neutral-500"
              thumbClassName="aspect-video w-full overflow-hidden rounded-xl bg-neutral-900"
            />
          ))}
        </div>
      </section>
    </>
  );
}
