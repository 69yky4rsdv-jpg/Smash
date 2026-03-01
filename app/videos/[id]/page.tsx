import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AgeGate } from "../../(site)/AgeGate";
import { SubscriptionGate } from "../../(site)/SubscriptionGate";
import { ScrollingTitle } from "../../(site)/ScrollingTitle";
import { getCategories, getModels, getVideos, getUsers, getVideoPhotoUrls, updateVideo } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-server";
import { getSiteSettings } from "@/lib/site-settings";
import { VideoPlayer } from "../VideoPlayer";
import { VideoEngagementControls } from "../VideoEngagementControls";
import { AdminThumbnailSelector } from "./AdminThumbnailSelector";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

async function setVideoThumbnailAction(videoId: string, thumbnailUrl: string) {
  "use server";
  updateVideo(videoId, { thumbnailUrl });
  revalidatePath(`/videos/${videoId}`);
  revalidatePath("/");
  revalidatePath("/videos");
}

export default async function VideoDetailPage({ params }: Props) {
  const { id } = await params;
  const videos = getVideos();
  const video = videos.find((v) => v.id === id);

  if (!video) {
    redirect("/videos");
  }

  const userId = await getAuthUserId();
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  const isAdmin = user?.role === "admin" || userId === "admin";
  const hasAccess =
    (!!user && (user.role === "admin" || !!user.subscriptionPlanId)) || userId === "admin";
  const photoUrls = isAdmin ? getVideoPhotoUrls(video.id) : [];
  const site = getSiteSettings();
  const enableAdminThumbnail = site.siteName === "SmashPov";

  const models = getModels();
  const videoModels = models.filter((m) => video.models.includes(m.id));
  const videoCategories = getCategories().filter((c) => video.categories.includes(c.id));
  const relatedVideos = videos
    .filter((v) => v.id !== video.id)
    .sort((a, b) => {
      const aOverlap = a.categories.filter((c) => video.categories.includes(c)).length;
      const bOverlap = b.categories.filter((c) => video.categories.includes(c)).length;
      return bOverlap - aOverlap;
    })
    .slice(0, 5);

  return (
    <AgeGate>
      <SubscriptionGate initialHasAccess={hasAccess} skipGate={userId === "admin" || isAdmin}>
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
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
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              <ScrollingTitle title={video.title} animateOnHover={false} />
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
              <p>
                {new Date(video.publishedAt).toLocaleDateString()} ·{" "}
                {videoModels.map((m) => m.stageName).join(", ")}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/videos/${video.id}/photos`}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-neutral-300 transition hover:bg-white/10 hover:text-neutral-100"
                >
                  Photos
                </Link>
                <VideoEngagementControls videoId={video.id} />
              </div>
            </div>
          </header>

          <section className="grid gap-8 md:grid-cols-[7fr,4fr] lg:grid-cols-[8fr,4fr]">
            <div className="space-y-4">
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-tr from-pink-500/20 via-black to-pink-700/40 shadow-[0_24px_65px_rgba(0,0,0,0.9)]">
                {video.videoUrl ? (
                  video.videoUrl.includes("iframe.mediadelivery.net") ? (
                    <iframe
                      src={video.videoUrl}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <VideoPlayer
                      src={video.videoUrl}
                      poster={video.thumbnailUrl}
                      className="h-full w-full object-cover"
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
              {isAdmin && enableAdminThumbnail && (
                <AdminThumbnailSelector
                  videoId={video.id}
                  currentThumbnailUrl={video.thumbnailUrl}
                  photoUrls={photoUrls}
                  setThumbnailAction={setVideoThumbnailAction}
                />
              )}
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
                          className="rounded-full bg-white/5 px-3 py-1 text-xs text-neutral-100"
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
                          className="rounded-full bg-white/5 px-3 py-1 text-xs text-neutral-100 hover:bg-accent-pink/20 hover:text-accent-pinkSoft"
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
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </SubscriptionGate>
    </AgeGate>
  );
}

