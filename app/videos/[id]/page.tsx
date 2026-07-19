import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCategories, getModels, getVideos, getVideoPhotoUrls, parsePhotoUrls, setVideoPhotos, updateVideo } from "@/lib/data";
import { getEngagementForVideos, getVideoEngagement, userHasLikedVideo } from "@/lib/video-engagement";
import { getSiteSettings } from "@/lib/site-settings";
import { VideoPlayer } from "../VideoPlayer";
import { VideoEngagementControls } from "../VideoEngagementControls";
import { AdminThumbnailSelector } from "./AdminThumbnailSelector";
import { AdminVideoEditForm } from "./AdminVideoEditForm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

async function setVideoThumbnailAction(videoId: string, thumbnailUrl: string) {
  "use server";
  const { isAdmin } = await getSession();
  if (!isAdmin) return;
  updateVideo(videoId, { thumbnailUrl });
  revalidatePath(`/videos/${videoId}`);
  revalidatePath("/");
  revalidatePath("/videos");
}

async function updateVideoFromDetailAction(formData: FormData) {
  "use server";
  const { isAdmin } = await getSession();
  if (!isAdmin) return;

  const videoId = String(formData.get("videoId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim() || undefined;
  const modelIds = formData.getAll("models").map(String);
  const categoryIds = formData.getAll("categories").map(String);
  const photoPaste = String(formData.get("photoUrls") ?? "");

  if (!videoId || !title || !videoUrl) return;

  updateVideo(videoId, {
    title,
    videoUrl,
    thumbnailUrl,
    models: modelIds,
    categories: categoryIds,
  });

  setVideoPhotos(videoId, parsePhotoUrls(photoPaste));

  revalidatePath(`/videos/${videoId}`);
  revalidatePath(`/videos/${videoId}/photos`);
  revalidatePath("/");
  revalidatePath("/videos");
  revalidatePath("/videos/trending");
  revalidatePath("/categories");
  revalidatePath("/admin");
  revalidatePath("/models");
}

export default async function VideoDetailPage({ params }: Props) {
  const { id } = await params;
  const videos = getVideos();
  const video = videos.find((v) => v.id === id);

  if (!video) {
    redirect("/videos");
  }

  const { isAdmin, hasSubscription, user } = await getSession();

  // If not logged in, or logged in without a subscription, send to pricing.
  if (!isAdmin && !hasSubscription) {
    redirect("/pricing");
  }

  const photoUrls = getVideoPhotoUrls(video.id);
  const site = getSiteSettings();
  const enableAdminThumbnail = site.siteName === "SmashPov" && photoUrls.length > 0;

  const models = getModels();
  const categories = getCategories();
  const videoModels = models.filter((m) => video.models.includes(m.id));
  const videoCategories = categories.filter((c) => video.categories.includes(c.id));
  const relatedVideos = videos
    .filter((v) => v.id !== video.id && Boolean(v.thumbnailUrl?.trim()))
    .sort((a, b) => {
      const aOverlap = a.categories.filter((c) => video.categories.includes(c)).length;
      const bOverlap = b.categories.filter((c) => video.categories.includes(c)).length;
      return bOverlap - aOverlap;
    })
    .slice(0, 5);

  const engagement = getVideoEngagement(video.id);
  const initialLiked = user ? userHasLikedVideo(user.id, video.id) : false;
  const relatedEngagement = getEngagementForVideos(relatedVideos.map((v) => v.id));

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-6 min-w-0 sm:px-4 sm:py-10 space-y-6 sm:space-y-8">
          <header className="space-y-3">
            <Link
              href="/videos"
              className="text-xs text-accent-pinkSoft hover:text-accent-pink"
            >
              ← Back to all videos
            </Link>
            <p className="text-xs text-accent-pinkSoft uppercase tracking-[0.18em]">
              Scene
            </p>
            <h1 className="max-w-full text-3xl font-semibold tracking-tight break-words md:text-4xl">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
              <p>
                {new Date(video.publishedAt).toLocaleDateString()} ·{" "}
                {videoModels.map((m) => m.stageName).join(", ")}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/videos/${video.id}/photos`}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-neutral-300 transition hover:bg-white/10 hover:text-neutral-100"
                >
                  Photos
                </Link>
                <VideoEngagementControls
                  videoId={video.id}
                  initialLiked={initialLiked}
                  initialEngagement={engagement}
                />
              </div>
            </div>
          </header>

          <section className="grid gap-6 md:grid-cols-[7fr,4fr] lg:grid-cols-[8fr,4fr] md:gap-8">
            <div className="min-w-0 space-y-4">
              <div className="aspect-video w-full max-w-full overflow-hidden rounded-xl bg-gradient-to-tr from-pink-500/20 via-black to-pink-700/40 shadow-[0_24px_65px_rgba(0,0,0,0.9)] sm:rounded-2xl">
                {video.videoUrl ? (
                  video.videoUrl.includes("iframe.mediadelivery.net") ? (
                    <div className="relative h-full w-full">
                      <iframe
                        src={video.videoUrl}
                        className="h-full w-full max-h-full max-w-full object-contain"
                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <div className="pointer-events-none absolute bottom-2 left-2 z-10">
                        <img
                          src="/logo/BIg-SMASHPOV.COM-2.png"
                          alt="SmashPov watermark"
                          className="h-16 opacity-80 drop-shadow-[0_0_12px_rgba(0,0,0,0.9)] sm:h-20"
                        />
                      </div>
                    </div>
                  ) : (
                    <VideoPlayer
                      src={video.videoUrl}
                      poster={video.thumbnailUrl}
                      className="h-full w-full max-h-full max-w-full"
                    />
                  )
                ) : video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              {enableAdminThumbnail && (
                <AdminThumbnailSelector
                  videoId={video.id}
                  currentThumbnailUrl={video.thumbnailUrl}
                  photoUrls={photoUrls}
                  setThumbnailAction={setVideoThumbnailAction}
                />
              )}
              {isAdmin ? (
                <AdminVideoEditForm
                  video={video}
                  models={models}
                  categories={categories}
                  photoUrls={photoUrls}
                  updateAction={updateVideoFromDetailAction}
                />
              ) : null}
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                {video.description && (
                  <p className="text-[13px] text-neutral-200">{video.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-[11px]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {videoCategories.map((cat) => (
                        <span
                          key={cat.id}
                          className="rounded-lg bg-white/5 px-3 py-1 text-xs text-neutral-100"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Models
                    </p>
                    <div className="flex flex-wrap gap-2 text-[13px]">
                      {videoModels.map((model) => (
                        <Link
                          key={model.id}
                          href={`/models/${model.id}`}
                          className="rounded-lg bg-white/5 px-3 py-1 text-xs text-neutral-100 hover:bg-pink-400/20 hover:text-pink-200"
                        >
                          {model.stageName}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <aside className="space-y-4 text-sm">
              <div className="card-surface p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-neutral-300 uppercase tracking-[0.18em]">
                    Watch next
                  </p>
                  <span className="text-[10px] text-neutral-500">Handpicked for you</span>
                </div>
                <div className="space-y-3">
                  {relatedVideos.map((next) => (
                    <Link
                      key={next.id}
                      href={`/videos/${next.id}`}
                      className="flex gap-3 rounded-lg bg-white/5 p-2 hover:bg-white/10"
                    >
                      <div className="aspect-video w-24 flex-shrink-0 overflow-hidden rounded-md bg-neutral-900">
                        {next.thumbnailUrl ? (
                          <img
                            src={next.thumbnailUrl}
                            alt={next.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-tr from-pink-500/30 via-black to-pink-700/40" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <p className="line-clamp-2 text-xs font-semibold text-neutral-100">
                          {next.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-neutral-500">
                          {new Date(next.publishedAt).toLocaleDateString()}
                          {relatedEngagement[next.id]?.views ? (
                            <> · {relatedEngagement[next.id]!.likePercent}% liked</>
                          ) : null}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>
  );
}

