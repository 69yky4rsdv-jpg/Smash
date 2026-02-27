import SiteShell from "../(site)/Shell";
import { AgeGate } from "../(site)/AgeGate";
import { categories, deleteVideo, getModels, getVideos, setVideoHidden, subscriptionPlans, updateVideo, users } from "@/lib/data";
import {
  createCategory,
  createModel,
  createVideo,
  deleteModel,
  setUserSubscription,
  toggleModelActive,
  updateModel
} from "@/lib/admin";
import { getSiteSettings, setSiteSettings } from "@/lib/site-settings";
import { revalidatePath } from "next/cache";
import { TagMultiSelect } from "./TagMultiSelect";
import { EditVideoForm } from "./EditVideoForm";
import { EditModelForm } from "./EditModelForm";

async function createCategoryAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  if (name) {
    createCategory(name);
  }
}

async function createModelAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || undefined;
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || undefined;
  const galleryRaw = String(formData.get("gallery") ?? "").trim();
  const galleryUrls =
    galleryRaw.length > 0
      ? galleryRaw
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean)
      : undefined;
  if (name) {
    createModel(name, bio, avatarUrl, galleryUrls);
  }
}

async function toggleModelAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  if (id) toggleModelActive(id);
}

async function deleteModelAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  deleteModel(id);
  revalidatePath("/models");
  revalidatePath("/admin");
}

async function createVideoAction(formData: FormData) {
  "use server";
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || undefined;
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim() || undefined;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const categoryIds = formData.getAll("categories").map(String);
  const modelIds = formData.getAll("models").map(String);

  if (!title || !videoUrl) return;

  createVideo({
    title,
    description,
    thumbnailUrl,
    videoUrl,
    categoryIds,
    modelIds
  });
  revalidatePath("/");
  revalidatePath("/videos");
  revalidatePath("/videos/trending");
  revalidatePath("/admin");
}

async function hideVideoAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const hidden = String(formData.get("hidden") ?? "") === "true";
  if (!id) return;
  setVideoHidden(id, hidden);
  revalidatePath("/");
  revalidatePath("/videos");
  revalidatePath("/videos/trending");
  revalidatePath("/admin");
}

async function deleteVideoAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  deleteVideo(id);
  revalidatePath("/");
  revalidatePath("/videos");
  revalidatePath("/videos/trending");
  revalidatePath("/admin");
}

async function updateVideoAction(formData: FormData) {
  "use server";
  const videoId = String(formData.get("videoId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || undefined;
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim() || undefined;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const categoryIds = formData.getAll("categories").map(String);
  const modelIds = formData.getAll("models").map(String);
  const isTrending = String(formData.get("isTrending") ?? "") === "true";
  if (!videoId || !title || !videoUrl) return;
  updateVideo(videoId, {
    title,
    description,
    thumbnailUrl,
    videoUrl,
    categories: categoryIds,
    models: modelIds,
    isTrending
  });
  revalidatePath("/");
  revalidatePath("/videos");
  revalidatePath("/videos/trending");
  revalidatePath("/admin");
}

async function updateModelAction(formData: FormData) {
  "use server";
  const modelId = String(formData.get("modelId") ?? "");
  const stageName = String(formData.get("stageName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || undefined;
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || undefined;
  const galleryRaw = String(formData.get("gallery") ?? "").trim();
  const galleryUrls =
    galleryRaw.length > 0
      ? galleryRaw
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean)
      : undefined;
  const active = String(formData.get("active") ?? "") === "true";
  if (!modelId || !stageName) return;
  updateModel(modelId, { stageName, bio, avatarUrl, galleryUrls, active });
  revalidatePath("/");
  revalidatePath("/models");
  revalidatePath("/admin");
}

async function updateSiteBrandingAction(formData: FormData) {
  "use server";
  const siteName = String(formData.get("siteName") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim() || undefined;
  const heroBannerImageUrl = String(formData.get("heroBannerImageUrl") ?? "").trim() || undefined;
  setSiteSettings({
    siteName: siteName || undefined,
    logoUrl,
    heroBannerImageUrl
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

async function setSubscriptionAction(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId") ?? "");
  const planId = String(formData.get("planId") ?? "") || undefined;
  if (!userId) return;
  setUserSubscription(userId, planId);
  revalidatePath("/admin");
}

export default function AdminPage() {
  const site = getSiteSettings();
  const videos = getVideos(true);
  const models = getModels();

  return (
    <AgeGate>
      <SiteShell>
          <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
            <header className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Admin dashboard</h1>
              <p className="text-sm text-neutral-300">
                Manage videos, models, categories, and user subscriptions.
              </p>
            </header>

            {/* Site branding */}
            <section className="card-surface p-5 space-y-4">
              <h2 className="text-lg font-semibold">Site branding</h2>
              <p className="text-[11px] text-neutral-400">
                Change the site name and logo shown in the header and footer. Logo URL can be a path (e.g. /logo.png) or full URL.
              </p>
              <form action={updateSiteBrandingAction} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-neutral-200 text-sm" htmlFor="siteName">
                    Site name
                  </label>
                  <input
                    id="siteName"
                    name="siteName"
                    defaultValue={site.siteName}
                    placeholder="e.g. VelvetStream"
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-200 text-sm" htmlFor="logoUrl">
                    Logo URL
                  </label>
                  <input
                    id="logoUrl"
                    name="logoUrl"
                    defaultValue={site.logoUrl ?? ""}
                    placeholder="/logo.png or https://..."
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-neutral-200 text-sm" htmlFor="heroBannerImageUrl">
                    Hero banner image URL
                  </label>
                  <p className="text-[11px] text-neutral-400 mb-1">
                    Full-width banner at the top of the homepage. Use a path (e.g. /banner.jpg) or full URL. Leave empty for a placeholder.
                  </p>
                  <input
                    id="heroBannerImageUrl"
                    name="heroBannerImageUrl"
                    defaultValue={site.heroBannerImageUrl ?? ""}
                    placeholder="/banner.jpg or https://..."
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                  />
                </div>
                <button className="btn-gradient col-span-full sm:col-span-1 w-full sm:w-auto justify-center text-sm">
                  Save branding
                </button>
              </form>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              {/* Video management */}
              <div className="card-surface p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Upload / add video</h2>
                  <span className="text-[11px] text-neutral-400">Creates an entry in memory</span>
                </div>
                <form action={createVideoAction} className="space-y-3 text-sm">
                  <div className="space-y-1">
                    <label className="text-neutral-200" htmlFor="title">
                      Title
                    </label>
                    <input
                      id="title"
                      name="title"
                      required
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-200" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={2}
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-200" htmlFor="thumbnailUrl">
                      Thumbnail URL
                    </label>
                    <input
                      id="thumbnailUrl"
                      name="thumbnailUrl"
                      placeholder="/thumbnails/my-scene.jpg"
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-200" htmlFor="videoUrl">
                      Video URL
                    </label>
                    <input
                      id="videoUrl"
                      name="videoUrl"
                      required
                      placeholder="/videos/my-scene.mp4"
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TagMultiSelect
                      name="categories"
                      label="Categories"
                      items={categories.map((cat) => ({ id: cat.id, label: cat.name }))}
                    />
                    <TagMultiSelect
                      name="models"
                      label="Models"
                      items={models.map((model) => ({ id: model.id, label: model.stageName }))}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-gradient mt-2 w-full justify-center text-sm"
                  >
                    Save video
                  </button>
                </form>

                <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-200">Edit existing video</h3>
                  <EditVideoForm
                    videos={videos}
                    categories={categories}
                    models={models}
                    updateVideoAction={updateVideoAction}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-neutral-300">Existing videos — hide or remove</p>
                  <div className="max-h-52 space-y-1 overflow-y-auto text-[11px] text-neutral-300">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1.5 ${video.hidden ? "opacity-60" : ""}`}
                      >
                        <a href={`/videos/${video.id}`} className="line-clamp-1 flex-1 hover:text-accent-pinkSoft">
                          {video.title}
                        </a>
                        <span className="text-neutral-500">
                          {new Date(video.publishedAt).toLocaleDateString()}
                          {video.hidden ? " · Hidden" : ""}
                        </span>
                        <div className="flex items-center gap-1">
                          <form action={hideVideoAction} className="inline">
                            <input type="hidden" name="id" value={video.id} />
                            <input type="hidden" name="hidden" value={video.hidden ? "false" : "true"} />
                            <button
                              type="submit"
                              className="rounded bg-white/10 px-2 py-0.5 text-[10px] hover:bg-white/20"
                            >
                              {video.hidden ? "Unhide" : "Hide"}
                            </button>
                          </form>
                          <form action={deleteVideoAction} className="inline">
                            <input type="hidden" name="id" value={video.id} />
                            <button
                              type="submit"
                              className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] text-red-300 hover:bg-red-500/30"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Models & categories */}
              <div className="space-y-4">
                <div className="card-surface p-5 space-y-3">
                  <h2 className="text-lg font-semibold">Models</h2>
                  <form action={createModelAction} className="grid gap-3 text-sm sm:grid-cols-[2fr,3fr]">
                  <div className="space-y-1">
                    <label className="text-neutral-200" htmlFor="model-name">
                      Stage name
                    </label>
                    <input
                      id="model-name"
                      name="name"
                      required
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-200" htmlFor="model-bio">
                      Short bio
                    </label>
                    <input
                      id="model-bio"
                      name="bio"
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-200" htmlFor="model-avatar">
                      Profile photo URL
                    </label>
                    <input
                      id="model-avatar"
                      name="avatarUrl"
                      placeholder="/images/models/anissa.jpg"
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-200" htmlFor="model-gallery">
                      Gallery image URLs (comma separated)
                    </label>
                    <input
                      id="model-gallery"
                      name="gallery"
                      placeholder="/images/models/anissa-1.jpg, /images/models/anissa-2.jpg"
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    />
                  </div>
                    <button className="btn-gradient col-span-full justify-center text-sm">
                      Add model
                    </button>
                  </form>
                  <form action={toggleModelAction} className="mt-4 space-y-2 text-xs">
                    <p className="font-semibold text-neutral-300">Current roster</p>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {models.map((model) => (
                        <button
                          key={model.id}
                          name="id"
                          value={model.id}
                          className="flex w-full items-center justify-between rounded-lg bg-white/5 px-2 py-1 text-left hover:bg-white/10"
                        >
                          <span>{model.stageName}</span>
                          <span
                            className={`text-[10px] ${
                              model.active ? "text-emerald-400" : "text-neutral-500"
                            }`}
                          >
                            {model.active ? "Active" : "Hidden"}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-neutral-500">
                      Click a model to toggle active/hidden.
                    </p>
                  </form>
                  <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
                    <h3 className="text-sm font-semibold text-neutral-200">Edit existing model</h3>
                    <EditModelForm models={models} updateModelAction={updateModelAction} />
                  </div>

                  <form action={deleteModelAction} className="mt-3 space-y-2 text-xs">
                    <p className="font-semibold text-red-400">Remove model</p>
                    <p className="text-[10px] text-neutral-500">
                      Select a model below to permanently remove them and detach from any videos.
                    </p>
                    <select
                      name="id"
                      className="w-full rounded-lg border border-red-500/40 bg-black/60 px-3 py-1.5 text-xs outline-none ring-red-500/40 focus:ring-2"
                    >
                      <option value="">Select model…</option>
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.stageName}
                        </option>
                      ))}
                    </select>
                    <button className="w-full rounded-full border border-red-500/60 bg-red-500/10 px-4 py-1.5 text-[11px] font-semibold text-red-200 hover:bg-red-500/20">
                      Delete model
                    </button>
                  </form>
                </div>

                <div className="card-surface p-5 space-y-3">
                  <h2 className="text-lg font-semibold">Categories</h2>
                  <form action={createCategoryAction} className="flex gap-2 text-sm">
                    <input
                      name="name"
                      placeholder="e.g. Cosplay, Threesome"
                      required
                      className="flex-1 rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    />
                    <button className="btn-gradient px-4 py-2 text-xs">Add</button>
                  </form>
                  <div className="flex flex-wrap gap-2 text-[11px] text-neutral-200">
                    {categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="rounded-full bg-white/5 px-3 py-1 text-xs text-neutral-100"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Users & subscriptions */}
            <section className="card-surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Users & subscriptions</h2>
                <span className="text-[11px] text-neutral-400">
                  Assign or clear plans for testing.
                </span>
              </div>
              <form action={setSubscriptionAction} className="space-y-3 text-sm">
                <div className="grid gap-3 sm:grid-cols-[2fr,2fr,auto]">
                  <div className="space-y-1">
                    <label className="text-neutral-200" htmlFor="userId">
                      User
                    </label>
                    <select
                      id="userId"
                      name="userId"
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.email} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-200" htmlFor="planId">
                      Plan
                    </label>
                    <select
                      id="planId"
                      name="planId"
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    >
                      <option value="">No subscription</option>
                      {subscriptionPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button className="btn-gradient w-full justify-center text-xs">
                      Update
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-4 space-y-2 text-xs">
                <p className="font-semibold text-neutral-300">All users (demo)</p>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1"
                    >
                      <div>
                        <p>{user.email}</p>
                        <p className="text-[10px] text-neutral-500">
                          {user.role}{" "}
                          {user.subscriptionPlanId
                            ? `• ${subscriptionPlans.find((p) => p.id === user.subscriptionPlanId)?.name ?? "Custom"}`
                            : "• No active plan"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
      </SiteShell>
    </AgeGate>
  );
}

