import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { getModels, getStoreVideos, userHasPurchasedStoreVideo } from "@/lib/data";
import { resolveStorePreviewPlayback } from "@/lib/store-access";
import { getStoreFeaturingLabel, isStoreExclusive } from "@/lib/store-listing";
import { getStoreVideoPrice } from "@/lib/store-checkout";
import { logStorePreviewPageView } from "@/lib/store-preview-analytics";
import { StorePreviewMediaWithAnalytics } from "../StorePreviewMediaWithAnalytics";
import { StorePurchasePanel } from "../StorePurchasePanel";
import { StoreTrustBadges } from "../StoreTrustBadges";
import { StorePreviewTracker } from "../StorePreviewTracker";
import { StorePreviewStatsPanel } from "../StorePreviewStatsPanel";

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
    : checkoutUrl || `/store/${video.id}/checkout`;
  const buyExternal = !hasFullAccess && Boolean(checkoutUrl);

  const hdrs = await headers();
  const visitId = logStorePreviewPageView({
    videoId: video.id,
    userAgent: hdrs.get("user-agent"),
    referer: hdrs.get("referer"),
    ip: hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip"),
    isAdmin,
    isLoggedIn: Boolean(user),
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6 space-y-5">
      <StorePreviewTracker videoId={video.id} visitId={visitId} />
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {exclusive ? (
            <span className="rounded-full border border-pink-400/40 bg-pink-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-pink-200">
              Exclusive
            </span>
          ) : null}
          {durationLabel ? (
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-neutral-200">
              {durationLabel}
            </span>
          ) : null}
          {featuring ? (
            <span className="text-[11px] text-neutral-500">Featuring {featuring}</span>
          ) : null}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{video.title}</h1>
        {!hasFullAccess ? (
          <p className="max-w-2xl text-sm text-neutral-400">
            {durationLabel && exclusive
              ? `${durationLabel} exclusive · buy once · free preview below`
              : durationLabel
                ? `${durationLabel} full scene · one-time purchase`
                : exclusive
                  ? "Exclusive full video · only available here"
                  : "Free preview below · unlock the full scene with a one-time purchase"}
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
              <StorePreviewMediaWithAnalytics
                videoId={video.id}
                visitId={visitId}
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
          {!hasFullAccess ? <StoreTrustBadges /> : null}
          {isAdmin ? (
            <div className="space-y-2">
              <StorePreviewStatsPanel videoId={video.id} compact />
              <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-100/90 break-all">
                Admin debug — {playback.mode} playback
                {playback.maxDurationSeconds ? ` (${playback.maxDurationSeconds}s)` : ""}
                {playback.src ? `: ${playback.src}` : " (no URL)"}
              </p>
            </div>
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
          videoId={video.id}
          visitId={visitId}
          durationLabel={durationLabel}
          featuring={featuring}
          exclusive={exclusive}
          publishedAt={video.publishedAt}
        />
      </section>
    </div>
  );
}
