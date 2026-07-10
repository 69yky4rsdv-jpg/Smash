import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getModels, getStoreVideos, userHasPurchasedStoreVideo } from "@/lib/data";
import { normalizeStoreMediaUrl } from "@/lib/store-media-url";
import { StorePreviewMedia } from "../StorePreviewMedia";

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
  const { user, isAdmin } = await getSession();
  const price = getVideoStorePrice(video.id);
  const owned = userHasPurchasedStoreVideo(user?.id, video.id, isAdmin);
  const previewSrc =
    normalizeStoreMediaUrl(video.previewUrl ?? "") || normalizeStoreMediaUrl(video.videoUrl);
  const usingPreviewField = Boolean(normalizeStoreMediaUrl(video.previewUrl ?? ""));

  const checkoutUrl = video.purchaseCheckoutUrl?.trim();
  const buyHref = owned
    ? `/store/${video.id}/watch`
    : user
      ? checkoutUrl || `/store/${video.id}/checkout`
      : `/store/${video.id}/signup`;
  const buyExternal = Boolean(user && !owned && checkoutUrl);

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
            <StorePreviewMedia
              key={previewSrc}
              src={previewSrc}
              poster={video.thumbnailUrl}
              className="h-full w-full"
              showErrors={isAdmin}
            />
          </div>
          {isAdmin ? (
            <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-100/90 break-all">
              Admin debug — playing {usingPreviewField ? "preview URL" : "full video URL"}: {previewSrc}
            </p>
          ) : null}
          {video.description ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-200">
              {video.description}
            </p>
          ) : null}
        </div>

        <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">Purchase</p>
          <p className="text-3xl font-bold text-white">${price.toFixed(2)}</p>
          {owned ? (
            <>
              <p className="text-xs text-emerald-300">You own this video.</p>
              <Link href={`/store/${video.id}/watch`} className="btn-gradient mt-2 w-full justify-center text-sm py-2">
                Watch full video
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs text-neutral-400">One-time access to this full video. Free account required — no membership.</p>
              {buyExternal ? (
                <a href={buyHref} className="btn-gradient mt-2 w-full justify-center text-sm py-2">
                  Buy Now
                </a>
              ) : (
                <Link href={buyHref} className="btn-gradient mt-2 w-full justify-center text-sm py-2">
                  Buy Now
                </Link>
              )}
            </>
          )}
          <div className="space-y-1 pt-2 text-xs text-neutral-300">
            <p>Performers: {performers.length ? performers.join(", ") : "Featured cast"}</p>
            <p>Published: {new Date(video.publishedAt).toLocaleDateString()}</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
