import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getModels, getStoreVideos, userHasPurchasedStoreVideo } from "@/lib/data";
import { resolveStorePreviewPlayback } from "@/lib/store-access";
import { getStoreFeaturingLabel, isStoreExclusive } from "@/lib/store-listing";
import { normalizeStoreMediaUrl } from "@/lib/store-media-url";
import { getStoreVideoPrice } from "@/lib/store-checkout";
import { StorePreviewMedia } from "../StorePreviewMedia";
import { StorePurchasePanel } from "../StorePurchasePanel";

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
  const performerNames = video.models
    .map((modelId) => models.find((model) => model.id === modelId)?.stageName)
    .filter(Boolean) as string[];
  const featuring = getStoreFeaturingLabel(video, performerNames);
  const exclusive = isStoreExclusive(video);
  const durationLabel = video.storeDurationLabel?.trim();

  const { user, isAdmin } = await getSession();
  const price = getStoreVideoPrice(video);
  const hasFullAccess = userHasPurchasedStoreVideo(user?.id, video.id, isAdmin);
  const playback = resolveStorePreviewPlayback(video, hasFullAccess);

  const checkoutUrl = video.purchaseCheckoutUrl?.trim();
  const buyHref = hasFullAccess
    ? `/store/${video.id}/watch`
    : user
      ? checkoutUrl || `/store/${video.id}/checkout`
      : `/store/${video.id}/signup`;
  const buyExternal = Boolean(user && !hasFullAccess && checkoutUrl);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-4 sm:py-10 space-y-6">
      <header className="space-y-3">
        <Link href="/store" className="text-xs text-accent-pinkSoft hover:text-accent-pink">
          ← Back to store
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-accent-pinkSoft uppercase tracking-[0.18em]">Preview</p>
          {exclusive ? (
            <span className="rounded-full border border-pink-400/40 bg-pink-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-pink-200">
              Exclusive
            </span>
          ) : null}
          {durationLabel ? (
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-neutral-200">
              {durationLabel} full scene
            </span>
          ) : null}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{video.title}</h1>
        {!hasFullAccess ? (
          <p className="max-w-2xl text-sm text-neutral-400">
            {durationLabel && exclusive
              ? `${durationLabel} exclusive full video · one-time purchase · 30 second free preview below`
              : durationLabel
                ? `${durationLabel} full video · buy once, watch anytime · free preview below`
                : exclusive
                  ? "Exclusive full video · only available here · free preview below"
                  : "Watch the free preview, then unlock the full scene with a one-time purchase."}
          </p>
        ) : null}
      </header>

      <section className="grid gap-6 md:grid-cols-[7fr,4fr]">
        <div className="space-y-4">
          <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-tr from-pink-500/20 via-black to-pink-700/40">
            {playback.mode === "locked" ? (
              <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-30 blur-sm"
                    aria-hidden
                  />
                ) : null}
                <div className="relative z-10 space-y-2">
                  <p className="text-sm font-medium text-white">Full video locked</p>
                  <p className="max-w-sm text-xs text-neutral-300">
                    Purchase to unlock
                    {durationLabel ? ` the full ${durationLabel} scene` : " the full video"}.
                  </p>
                </div>
              </div>
            ) : (
              <StorePreviewMedia
                key={`${playback.src}-${playback.maxDurationSeconds ?? 0}`}
                src={playback.src}
                poster={video.thumbnailUrl}
                className="h-full w-full"
                showErrors={isAdmin}
                maxDurationSeconds={
                  playback.mode === "timed-preview" ? playback.maxDurationSeconds : undefined
                }
                buyHref={hasFullAccess ? undefined : buyHref}
                buyExternal={buyExternal}
                durationLabel={durationLabel}
                price={hasFullAccess ? undefined : price}
              />
            )}
          </div>
          {isAdmin ? (
            <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-100/90 break-all">
              Admin debug — {playback.mode} playback
              {playback.maxDurationSeconds ? ` (${playback.maxDurationSeconds}s)` : ""}
              {playback.src ? `: ${playback.src}` : " (no URL)"}
            </p>
          ) : null}
          {video.description ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">About this scene</p>
              <p className="text-sm text-neutral-200 whitespace-pre-wrap">{video.description}</p>
            </div>
          ) : null}
        </div>

        <StorePurchasePanel
          price={price}
          hasFullAccess={hasFullAccess}
          watchHref={`/store/${video.id}/watch`}
          buyHref={buyHref}
          buyExternal={buyExternal}
          durationLabel={durationLabel}
          featuring={featuring}
          exclusive={exclusive}
          publishedAt={video.publishedAt}
        />
      </section>
    </div>
  );
}
