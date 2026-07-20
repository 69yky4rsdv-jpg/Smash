import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { ConversionTrustStrip } from "../(site)/ConversionTrustStrip";
import {
  appendStoreVideo,
  deleteStoreVideo,
  getCategories,
  getModels,
  getVideoPhotoUrls,
  getStoreVideos,
  saveStoreVideos,
  updateStoreVideo,
} from "@/lib/data";
import { TagMultiSelect } from "../admin/TagMultiSelect";
import type { Video } from "@/lib/types";
import { normalizeStoreMediaUrl } from "@/lib/store-media-url";
import { getStorePurchaseSuccessUrl, getStoreVideoPrice, parseStorePrice } from "@/lib/store-checkout";
import { getStorePreviewStats } from "@/lib/store-preview-analytics";
import { parseStorePreviewDuration, STORE_PREVIEW_DURATION_OPTIONS } from "@/lib/store-access";
import { parseStoreListingFields } from "@/lib/store-listing";
import { CopyableUrl } from "./CopyableUrl";

export const dynamic = "force-dynamic";

async function deleteAllVideosAction() {
  "use server";
  const { isAdmin } = await getSession();
  if (!isAdmin) return;
  saveStoreVideos([]);
  revalidatePath("/store");
  redirect("/store");
}

async function addVideoAction(formData: FormData) {
  "use server";
  const { isAdmin } = await getSession();
  if (!isAdmin) return;

  const title = String(formData.get("title") ?? "").trim();
  const thumbnailUrl = normalizeStoreMediaUrl(String(formData.get("thumbnailUrl") ?? ""));
  const videoUrl = normalizeStoreMediaUrl(String(formData.get("videoUrl") ?? ""));
  const previewUrl = normalizeStoreMediaUrl(String(formData.get("previewUrl") ?? ""));
  const purchaseCheckoutUrl = String(formData.get("purchaseCheckoutUrl") ?? "").trim();
  const listing = parseStoreListingFields(formData);
  const previewDurationSeconds = parseStorePreviewDuration(
    String(formData.get("previewDurationSeconds") ?? "30")
  );
  const storePrice = parseStorePrice(String(formData.get("storePrice") ?? ""));
  const categoryIds = formData.getAll("categories").map(String);
  const modelIds = formData.getAll("models").map(String);

  if (!title || !videoUrl) return;

  const now = new Date().toISOString().slice(0, 10);
  const video: Video = {
    id: randomUUID(),
    title,
    description: listing.description,
    thumbnailUrl: thumbnailUrl || undefined,
    videoUrl,
    previewUrl: previewUrl || undefined,
    purchaseCheckoutUrl: purchaseCheckoutUrl || undefined,
    previewDurationSeconds,
    storePrice,
    storeDurationLabel: listing.storeDurationLabel,
    storeFeaturing: listing.storeFeaturing,
    storeExclusive: listing.storeExclusive,
    publishedAt: now,
    categories: categoryIds,
    models: modelIds,
  };

  appendStoreVideo(video);
  revalidatePath("/store");
  redirect(`/store#video-${video.id}`);
}

async function updateStoreVideoAction(formData: FormData) {
  "use server";
  const { isAdmin } = await getSession();
  if (!isAdmin) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const title = String(formData.get("title") ?? "").trim();
  const categoryIds = formData.getAll("categories").map(String);
  const modelIds = formData.getAll("models").map(String);
  const thumbnailUrl = normalizeStoreMediaUrl(String(formData.get("thumbnailUrl") ?? ""));
  const videoUrl = normalizeStoreMediaUrl(String(formData.get("videoUrl") ?? ""));
  const previewUrl = normalizeStoreMediaUrl(String(formData.get("previewUrl") ?? ""));
  const purchaseCheckoutUrl = String(formData.get("purchaseCheckoutUrl") ?? "").trim();
  const listing = parseStoreListingFields(formData);
  const previewDurationSeconds = parseStorePreviewDuration(
    String(formData.get("previewDurationSeconds") ?? "30")
  );
  const storePrice = parseStorePrice(String(formData.get("storePrice") ?? ""));

  if (!title || !videoUrl) return;

  updateStoreVideo(id, {
    title,
    description: listing.description,
    categories: categoryIds,
    models: modelIds,
    thumbnailUrl,
    videoUrl,
    previewUrl,
    purchaseCheckoutUrl,
    previewDurationSeconds,
    storePrice,
    storeDurationLabel: listing.storeDurationLabel,
    storeFeaturing: listing.storeFeaturing,
    storeExclusive: listing.storeExclusive,
  });

  revalidatePath("/store");
  revalidatePath(`/store/${id}`);
  redirect("/store");
}

async function setThumbnailFromGalleryAction(formData: FormData) {
  "use server";
  const { isAdmin } = await getSession();
  if (!isAdmin) return;
  const id = String(formData.get("id") ?? "").trim();
  const thumbnailUrl = normalizeStoreMediaUrl(String(formData.get("pickThumbnailUrl") ?? ""));
  if (!id || !thumbnailUrl) return;
  updateStoreVideo(id, { thumbnailUrl });
  revalidatePath("/store");
  revalidatePath(`/store/${id}`);
  redirect("/store");
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
  redirect("/store");
}

export default async function StorePage() {
  const videos = getStoreVideos();
  const models = getModels();
  const categories = getCategories();
  const modelById = new Map(models.map((model) => [model.id, model]));
  const { isAdmin } = await getSession();

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-4 sm:py-10 space-y-6">
      <header className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-accent-pinkSoft uppercase tracking-[0.18em]">Store</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Full Videos For Purchase
          </h1>
          <p className="max-w-3xl text-sm text-neutral-300">
            Preview any scene free, then buy once for instant access. Secure Stripe checkout — no
            subscription required.
          </p>
        </div>
        <ConversionTrustStrip compact />
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
                <label className="text-[11px] text-neutral-400">Price (USD)</label>
                <input
                  name="storePrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 19.99 — blank = auto"
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
                  placeholder="mp4, m3u8, or Bunny embed URL"
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none focus:ring-2 ring-amber-400/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Timed preview (optional)</label>
                <select
                  name="previewDurationSeconds"
                  defaultValue="30"
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-neutral-200 outline-none focus:ring-2 ring-amber-400/30"
                >
                  {STORE_PREVIEW_DURATION_OPTIONS.map((option) => (
                    <option key={option.value || "off"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-500">
                  Plays the first 30 seconds of the full video when no separate preview URL is set.
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Length (shown on product page)</label>
                <input
                  name="storeDurationLabel"
                  placeholder="e.g. 40 min"
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none focus:ring-2 ring-amber-400/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Featuring (optional)</label>
                <input
                  name="storeFeaturing"
                  placeholder="e.g. Summer — used if no models tagged"
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none focus:ring-2 ring-amber-400/30"
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  name="storeExclusive"
                  id="add-storeExclusive"
                  defaultChecked
                  className="rounded border-white/20"
                />
                <label htmlFor="add-storeExclusive" className="text-[11px] text-neutral-300">
                  Show as exclusive (only on this site)
                </label>
              </div>
              <div className="md:col-span-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-neutral-400">
                After you add a video, its Stripe success URL is generated automatically and shown in the edit section below.
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] text-neutral-400">Stripe checkout URL (one-time purchase)</label>
                <input
                  name="purchaseCheckoutUrl"
                  placeholder="https://buy.stripe.com/..."
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none focus:ring-2 ring-amber-400/30"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] text-neutral-400">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="2–3 sentences about the scene for the product page…"
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none focus:ring-2 ring-amber-400/30"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:col-span-2">
                <TagMultiSelect
                  name="categories"
                  label="Categories"
                  items={categories.map((c) => ({ id: c.id, label: c.name }))}
                />
                <TagMultiSelect
                  name="models"
                  label="Models"
                  items={models.map((m) => ({ id: m.id, label: m.stageName }))}
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
                const successUrl = getStorePurchaseSuccessUrl(video.id);
                const previewStats = getStorePreviewStats(video.id);
                return (
                  <div
                    key={video.id}
                    id={`video-${video.id}`}
                    className="scroll-mt-24 rounded-xl border border-white/10 bg-black/40 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-neutral-100">{video.title}</p>
                      <Link href={`/store/${video.id}`} className="text-xs text-amber-200 hover:text-amber-100 underline">
                        Open preview page
                      </Link>
                    </div>

                    <CopyableUrl url={successUrl} />

                    <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[11px] text-neutral-300">
                      <span className="text-neutral-400">Preview traffic:</span> You {previewStats.pageviews.admin}{" "}
                      · Visitors {previewStats.pageviews.visitor} · Bots {previewStats.pageviews.bot} · Plays{" "}
                      {previewStats.previewPlays} · Buy {previewStats.buyClicks}
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

                    <form action={updateStoreVideoAction} className="grid gap-3 md:grid-cols-2">
                      <input type="hidden" name="id" value={video.id} />
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[11px] text-neutral-400">Title</label>
                        <input
                          name="title"
                          required
                          defaultValue={video.title}
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs outline-none focus:ring-2 ring-amber-400/30"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 md:col-span-2">
                        <TagMultiSelect
                          name="categories"
                          label="Categories"
                          items={categories.map((c) => ({ id: c.id, label: c.name }))}
                          selectedIds={video.categories ?? []}
                        />
                        <TagMultiSelect
                          name="models"
                          label="Models"
                          items={models.map((m) => ({ id: m.id, label: m.stageName }))}
                          selectedIds={video.models ?? []}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-neutral-400">Price (USD)</label>
                        <input
                          name="storePrice"
                          type="number"
                          step="0.01"
                          min="0.01"
                          defaultValue={video.storePrice ?? ""}
                          placeholder={`Auto: $${getStoreVideoPrice(video).toFixed(2)}`}
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs outline-none focus:ring-2 ring-amber-400/30"
                        />
                        <p className="text-[10px] text-neutral-500">
                          Shown now: ${getStoreVideoPrice(video).toFixed(2)}
                          {video.storePrice ? " (custom)" : " (auto)"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-neutral-400">Length (product page)</label>
                        <input
                          name="storeDurationLabel"
                          defaultValue={video.storeDurationLabel ?? ""}
                          placeholder="e.g. 40 min"
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs outline-none focus:ring-2 ring-amber-400/30"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-neutral-400">Featuring (optional)</label>
                        <input
                          name="storeFeaturing"
                          defaultValue={video.storeFeaturing ?? ""}
                          placeholder="e.g. Summer"
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs outline-none focus:ring-2 ring-amber-400/30"
                        />
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <input
                          type="checkbox"
                          name="storeExclusive"
                          id={`exclusive-${video.id}`}
                          defaultChecked={video.storeExclusive !== false}
                          className="rounded border-white/20"
                        />
                        <label htmlFor={`exclusive-${video.id}`} className="text-[11px] text-neutral-300">
                          Show as exclusive (only on this site)
                        </label>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[11px] text-neutral-400">Description (product page)</label>
                        <textarea
                          name="description"
                          rows={3}
                          defaultValue={video.description ?? ""}
                          placeholder="About this scene…"
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs outline-none focus:ring-2 ring-amber-400/30"
                        />
                      </div>
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
                      <div className="space-y-1">
                        <label className="text-[11px] text-neutral-400">Timed preview</label>
                        <select
                          name="previewDurationSeconds"
                          defaultValue={video.previewDurationSeconds === 0 ? "0" : "30"}
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-neutral-200 outline-none focus:ring-2 ring-amber-400/30"
                        >
                          {STORE_PREVIEW_DURATION_OPTIONS.map((option) => (
                            <option key={option.value || "off"} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-neutral-400">Stripe checkout URL</label>
                        <input
                          name="purchaseCheckoutUrl"
                          defaultValue={video.purchaseCheckoutUrl ?? ""}
                          placeholder="https://buy.stripe.com/..."
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs outline-none focus:ring-2 ring-amber-400/30"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <button type="submit" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-white/10">
                          Save changes
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
          const price = getStoreVideoPrice(video);
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
                <p className="text-[11px] text-neutral-400">One-time purchase · preview free</p>
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
