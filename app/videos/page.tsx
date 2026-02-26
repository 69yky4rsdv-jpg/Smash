import SiteShell from "../(site)/Shell";
import { AgeGate } from "../(site)/AgeGate";
import { getVideos } from "@/lib/data";
import Link from "next/link";

export default function AllVideosPage() {
  const videos = getVideos();
  return (
    <AgeGate>
      <SiteShell>
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">All videos</h1>
            <p className="text-sm text-neutral-300">
              Browse the full catalog. Click any thumbnail to open the scene page.
            </p>
          </header>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
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

          {/* Affiliate sign up */}
          <section className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <h2 className="text-lg font-semibold text-neutral-100">Become an affiliate</h2>
            <p className="mt-2 max-w-xl mx-auto text-sm text-neutral-400">
              Earn recurring revenue by promoting our library. High payouts, real-time stats, and
              branded creatives.
            </p>
            <Link
              href="/affiliate"
              className="btn-gradient mt-4 inline-flex text-sm px-6 py-2"
            >
              Affiliate sign up
            </Link>
          </section>
        </div>
      </SiteShell>
    </AgeGate>
  );
}

