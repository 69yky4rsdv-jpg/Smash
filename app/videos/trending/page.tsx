import SiteShell from "../../(site)/Shell";
import { AgeGate } from "../../(site)/AgeGate";
import { getVideos } from "@/lib/data";
import Link from "next/link";

export default function TrendingVideosPage() {
  const videos = getVideos();
  const trending = videos.filter(
    (v) => v.isTrending || (v.categories && v.categories.includes("trending"))
  );

  return (
    <AgeGate>
      <SiteShell>
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Trending videos</h1>
            <p className="text-sm text-neutral-300">
              The scenes fans are watching the most right now.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
            {trending.map((video) => (
              <Link
                key={video.id}
                href={`/videos/${video.id}`}
                className="card-surface overflow-hidden"
              >
                <div className="aspect-video w-full bg-gradient-to-tr from-pink-500/30 via-black to-pink-700/40" />
                <div className="p-3 space-y-1">
                  <h3 className="text-xs font-semibold line-clamp-2">{video.title}</h3>
                  <p className="text-[10px] text-neutral-400">
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </SiteShell>
    </AgeGate>
  );
}

