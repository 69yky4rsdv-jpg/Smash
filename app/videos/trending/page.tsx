import { getVideos } from "@/lib/data";
import { TrendingGridClient } from "./TrendingGridClient";

export default function TrendingVideosPage() {
  const videos = getVideos();
  const trending = videos.filter(
    (v) => v.isTrending || (v.categories && v.categories.includes("trending"))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Trending videos</h1>
          <p className="text-sm text-neutral-300">
            The scenes fans are watching the most right now.
          </p>
        </header>
        <TrendingGridClient videos={trending} />
      </div>
  );
}

