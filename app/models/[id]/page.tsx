import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AgeGate } from "../../(site)/AgeGate";
import { GalleryWithLightbox } from "../../(site)/GalleryWithLightbox";
import { getModels, getVideos, getUsers, getVideoPhotoUrls } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-server";
import { getSiteSettings } from "@/lib/site-settings";
import { updateModel } from "@/lib/admin";
import { ModelAdminSelectors } from "./ModelAdminSelectors";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

async function setModelAvatarAction(modelId: string, avatarUrl: string) {
  "use server";
  updateModel(modelId, { avatarUrl });
  revalidatePath("/models");
  revalidatePath(`/models/${modelId}`);
}

async function setRandomModelAvatarAction(modelId: string) {
  "use server";
  const models = getModels();
  const model = models.find((m) => m.id === modelId);
  if (!model) return;
  const videos = getVideos(true).filter((v) => v.models.includes(modelId));
  const pool: string[] = [];
  for (const v of videos) {
    const urls = getVideoPhotoUrls(v.id);
    for (const u of urls) {
      if (u && !pool.includes(u)) pool.push(u);
    }
  }
  if (pool.length === 0) return;
  const randomUrl = pool[Math.floor(Math.random() * pool.length)]!;
  updateModel(modelId, { avatarUrl: randomUrl });
  revalidatePath("/models");
  revalidatePath(`/models/${modelId}`);
}

async function addModelGalleryUrlsAction(modelId: string, urls: string[]) {
  "use server";
  const models = getModels();
  const model = models.find((m) => m.id === modelId);
  if (!model || urls.length === 0) return;
  const existing = model.galleryUrls ?? [];
  const combined = [...existing];
  for (const u of urls) {
    const url = u.trim();
    if (url && !combined.includes(url)) combined.push(url);
  }
  updateModel(modelId, { galleryUrls: combined });
  revalidatePath("/models");
  revalidatePath(`/models/${modelId}`);
}

export default async function ModelDetailPage({ params }: Props) {
  const { id } = await params;
  const models = getModels();
  const model = models.find((m) => m.id === id);

  if (!model) {
    redirect("/models");
  }

  const videos = getVideos().filter((v) => v.models.includes(model.id));
  const galleryUrls = model.galleryUrls ?? [];

  const userId = await getAuthUserId();
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  const isAdmin = user?.role === "admin" || userId === "admin";
  const site = getSiteSettings();
  const enableAdminProfileGallery = site.siteName === "SmashPov";

  const photoPoolUrls: string[] = [];
  if (isAdmin && videos.length > 0) {
    const seen = new Set<string>();
    for (const v of videos) {
      const urls = getVideoPhotoUrls(v.id);
      for (const u of urls) {
        if (u && !seen.has(u)) {
          seen.add(u);
          photoPoolUrls.push(u);
        }
      }
    }
  }

  return (
    <AgeGate>
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
          <header className="space-y-2">
            <Link
              href="/models"
              className="text-xs text-accent-pinkSoft hover:text-accent-pink"
            >
              ← Back to all models
            </Link>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full bg-gradient-pink">
                {model.avatarUrl ? (
                  <img
                    src={model.avatarUrl}
                    alt={model.stageName}
                    className="h-full w-full object-contain"
                  />
                ) : null}
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight">{model.stageName}</h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                  {model.gender && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-neutral-300">
                      {model.gender === "female" ? "Female" : "Male"} performer
                    </span>
                  )}
                  <span>
                    {model.active ? "Active" : "Taking a break"}
                  </span>
                </div>
                {model.bio && (
                  <p className="mt-3 max-w-xl text-sm text-neutral-300">{model.bio}</p>
                )}
              </div>
            </div>
          </header>

          {isAdmin && enableAdminProfileGallery && (
            <ModelAdminSelectors
              modelId={model.id}
              currentAvatarUrl={model.avatarUrl}
              currentGalleryUrls={galleryUrls}
              photoPoolUrls={photoPoolUrls}
              setAvatarAction={setModelAvatarAction}
              setRandomAvatarAction={setRandomModelAvatarAction}
              addGalleryUrlsAction={addModelGalleryUrlsAction}
            />
          )}

          {galleryUrls.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Gallery</h2>
              <p className="text-xs text-neutral-500">Click any image to zoom</p>
              <GalleryWithLightbox
                urls={galleryUrls}
                altPrefix={`${model.stageName} gallery`}
                gridClassName="grid gap-3 sm:grid-cols-2 md:grid-cols-3"
              />
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Scenes</h2>
            {videos.length === 0 ? (
              <p className="text-sm text-neutral-500">No scenes yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <Link
                    key={video.id}
                    href={`/videos/${video.id}`}
                    className="group"
                  >
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
            )}
          </section>
        </div>
    </AgeGate>
  );
}
