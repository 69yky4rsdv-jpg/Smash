import Link from "next/link";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import {
  appendStoreVideo,
  deleteStoreVideo,
  getModels,
  getVideoPhotoUrls,
  getStoreVideos,
  saveStoreVideos,
  updateStoreVideo,
} from "@/lib/data";
import type { Video } from "@/lib/types";

function getVideoStorePrice(videoId: string): number {
  const hash = Array.from(videoId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const tiers = [14.99, 17.99, 19.99, 22.99, 24.99, 27.99];
  return tiers[hash % tiers.length]!;
}

export const dynamic = "force-dynamic";

async function deleteAllVideosAction() {
  "use server";
  const { isAdmin } = await getSession();
  if (!isAdmin) return;
  saveStoreVideos([]);
  revalidatePath("/store");
}

async function addVideoAction(formData: FormData) {
  "use server";
  const { isAdmin } = await getSession();
  if (!isAdmin) return;

  const title = String(formData.get("title") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const previewUrl = String(formData.get("previewUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title || !videoUrl) return;

  const now = new Date().toISOString().slice(0, 10);
  const video: Video = {
    id: randomUUID(),
    title,
    description: description || undefined,
    thumbnailUrl: thumbnailUrl || undefined,
    videoUrl,
    previewUrl: previewUrl || undefined,
    publishedAt: now,
    categories: [],
    models: [],
  };

  appendStoreVideo(video);
  revalidatePath("/store");
}

async function updateStoreVideoAction(formData: FormData) {
  "use server";
  const { isAdmin } = await getSession();
  if (!isAdmin) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const previewUrl = String(formData.get("previewUrl") ?? "").trim();

  updateStoreVideo(id, {
    thumbnailUrl: thumbnailUrl || undefined,
    videoUrl: videoUrl || undefined,
    previewUrl: previewUrl || undefined,
  });

  revalidatePath("/store");
  revalidatePath(`/store/${id}`);
}

async function setThumbnailFromGalleryAction(formData: FormData) {
  "use server";
  const { isAdmin } = await getSession();
  if (!isAdmin) return;
  const id = String(formData.get("id") ?? "").trim();
  const thumbnailUrl = String(formData.get("pickThumbnailUrl") ?? "").trim();
  if (!id || !thumbnailUrl) return;
  updateStoreVideo(id, { thumbnailUrl });
  revalidatePath("/store");
  revalidatePath(`/store/${id}`);
}

async function deleteSingleVideoAction(formData: FormData) {
  "use server";
  const { isAdmin } = await getSession();
  if (!isAdmin) return;
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  deleteStoreVideo(id);
  revalidatePath("/store");
  revalidatePath(`/store/${id}`);
}

export default async function StorePage() {
  const videos = getStoreVideos();
  const models = getModels();
  const modelById = new Map(models.map((model) => [model.id, model]));
  const { isAdmin } = await getSession();

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-4 sm:py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-xs text-accent-pinkSoft uppercase tracking-[0.18em]">Store</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Full Videos For Purchase
        </h1>
        <p className="max-w-3xl text-sm text-neutral-300">
          Browse all available scenes, view each preview page, and purchase access instantly.
        </p>
      </header>

      {isAdmin && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">Admin — Store video tool</p>
              <p className="text-[11px] text-neutral-400">
                Manage store videos here only (not in /admin). Changes write to your `store-videos.json`.
              </p>
            </div>
            <form action={deleteAllVideosAction}>
              <button
                type="submit"
                className="rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20"
              >
                Delete ALL videos
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
            <p className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Add new video</p>
            <form action={addVideoAction} className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Title</label>
                <input
                  name="title"
                  required
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none focus:ring-2 ring-amber-400/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Thumbnail URL (CDN)</label>
                <input
                  name="thumbnailUrl"
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none focus:ring-2 ring-amber-400/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Full video CDN link</label>
                <input
                  name="videoUrl"
                  required
                  placeholder="https://... (mp4 or m3u8 or iframe.mediadelivery.net)"
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none focus:ring-2 ring-amber-400/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Preview CDN link</label>
                <input
                  name="previewUrl"
                  placeholder="https://... (optional)"
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none focus:ring-2 ring-amber-400/30"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] text-neutral-400">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none focus:ring-2 ring-amber-400/30"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="btn-gradient px-5 py-2 text-sm">
                  Add video
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Edit existing store videos</p>
            <div className="grid gap-3">
              {videos.map((video) => {
                const gallery = getVideoPhotoUrls(video.id).slice(0, 60);
                return (
                  <div key={video.id} className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-neutral-100">{video.title}</p>
                      <Link href={`/store/${video.id}`} className="text-xs text-amber-200 hover:text-amber-100 underline">
                        Open preview page
                      </Link>
                    </div>

                    {gallery.length > 0 && (
                      <form action={setThumbnailFromGalleryAction} className="grid gap-2 md:grid-cols-[1fr,auto]">
                        <input type="hidden" name="id" value={video.id} />
                        <select
                          name="pickThumbnailUrl"
                          defaultValue=""
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-neutral-200 outline-none focus:ring-2 ring-amber-400/30"
                        >
                          <option value="" disabled>
                            Select thumbnail from photo gallery…
                          </option>
                          {gallery.map((url) => (
                            <option key={url} value={url}>
                              {url}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/20">
                          Set thumbnail
                        </button>
                      </form>
                    )}

                    <form action={updateStoreVideoAction} className="grid gap-3 md:grid-cols-3">
                      <input type="hidden" name="id" value={video.id} />
                      <div className="space-y-1">
                        <label className="text-[11px] text-neutral-400">Thumbnail URL</label>
                        <input
                          name="thumbnailUrl"
                          defaultValue={video.thumbnailUrl ?? ""}
                          placeholder="https://..."
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs outline-none focus:ring-2 ring-amber-400/30"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-neutral-400">Full video CDN link</label>
                        <input
                          name="videoUrl"
                          defaultValue={video.videoUrl ?? ""}
                          placeholder="https://..."
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs outline-none focus:ring-2 ring-amber-400/30"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-neutral-400">Preview CDN link</label>
                        <input
                          name="previewUrl"
                          defaultValue={(video as Video).previewUrl ?? ""}
                          placeholder="https://..."
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs outline-none focus:ring-2 ring-amber-400/30"
                        />
                      </div>
                      <div className="md:col-span-3 flex justify-end">
                        <button type="submit" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-white/10">
                          Save links
                        </button>
                      </div>
                    </form>
                    <div className="flex justify-end">
                      <form action={deleteSingleVideoAction}>
                        <input type="hidden" name="id" value={video.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20"
                        >
                          Delete this video
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => {
          const price = getVideoStorePrice(video.id);
          const performerNames = video.models
            .map((modelId) => modelById.get(modelId)?.stageName)
            .filter(Boolean) as string[];
          return (
            <article
              key={video.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              <div className="aspect-video bg-gradient-to-tr from-pink-500/20 via-black to-pink-700/40">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="line-clamp-2 text-sm font-semibold text-neutral-100">{video.title}</h2>
                <p className="mt-2 line-clamp-1 text-xs text-neutral-400">
                  {performerNames.length ? performerNames.join(", ") : "Featured performers"}
                </p>
                <p className="mt-3 text-2xl font-bold text-white">
                  ${price.toFixed(2)}
                </p>
                <p className="text-[11px] text-neutral-400">One-time video purchase</p>
                <Link href={`/store/${video.id}`} className="btn-gradient mt-4 w-full justify-center text-xs py-2">
                  Preview & Buy
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
