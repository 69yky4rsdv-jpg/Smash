import Link from "next/link";
import { redirect } from "next/navigation";
import { getModels, getStoreVideos, subscriptionPlans } from "@/lib/data";
import { VideoPlayer } from "../../videos/VideoPlayer";

function getVideoStorePrice(videoId: string): number {
  const hash = Array.from(videoId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const tiers = [14.99, 17.99, 19.99, 22.99, 24.99, 27.99];
  return tiers[hash % tiers.length]!;
}

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function StoreVideoPage({ params }: Props) {
  const { id } = await params;
  const videos = getStoreVideos();
  const video = videos.find((item) => item.id === id);

  if (!video) {
    redirect("/store");
  }

  const models = getModels();
  const performers = video.models
    .map((modelId) => models.find((model) => model.id === modelId)?.stageName)
    .filter(Boolean) as string[];
  const price = getVideoStorePrice(video.id);
  const checkoutUrl = subscriptionPlans.find((plan) => plan.id === "monthly")?.checkoutUrl ?? "/pricing";
  const previewSrc = video.previewUrl || video.videoUrl;

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-4 sm:py-10 space-y-6">
      <header className="space-y-2">
        <Link href="/store" className="text-xs text-accent-pinkSoft hover:text-accent-pink">
          ← Back to store
        </Link>
        <p className="text-xs text-accent-pinkSoft uppercase tracking-[0.18em]">Preview</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{video.title}</h1>
      </header>

      <section className="grid gap-6 md:grid-cols-[7fr,4fr]">
        <div className="space-y-4">
          <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-tr from-pink-500/20 via-black to-pink-700/40">
            <VideoPlayer src={previewSrc} poster={video.thumbnailUrl} className="h-full w-full" />
          </div>
          {video.description ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-200">
              {video.description}
            </p>
          ) : null}
        </div>

        <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">Purchase</p>
          <p className="text-3xl font-bold text-white">${price.toFixed(2)}</p>
          <p className="text-xs text-neutral-400">One-time access to this full video.</p>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient mt-2 w-full justify-center text-sm py-2"
          >
            Buy Now
          </a>
          <div className="space-y-1 pt-2 text-xs text-neutral-300">
            <p>Performers: {performers.length ? performers.join(", ") : "Featured cast"}</p>
            <p>Published: {new Date(video.publishedAt).toLocaleDateString()}</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
