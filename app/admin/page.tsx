import SiteShell from "../(site)/Shell";
import { AgeGate } from "../(site)/AgeGate";
import { addVideoPhotos, deleteVideo, getCategories, getModels, getVideos, getUsers, parsePhotoUrls, setVideoHidden, subscriptionPlans, updateVideo } from "@/lib/data";
import {
  autoCategorizeModelGenders,
  createCategory,
  createModel,
  createVideo,
  deleteModel,
  setUserSubscription,
  toggleModelActive,
  updateModel
} from "@/lib/admin";
import { fetchAllBunnyVideos, buildBunnyHlsUrl, buildBunnyThumbnailUrl } from "@/lib/bunny";
import { parseTxtMetadata, applyTxtMetadataToVideos } from "@/lib/import-txt";
import { importPhotoSetsFromBunny } from "@/lib/import-photosets";
import { listBunnyStorageDir } from "@/lib/bunny-storage";
import { getSiteSettings, setSiteSettings } from "@/lib/site-settings";
import { revalidatePath } from "next/cache";
import { TagMultiSelect } from "./TagMultiSelect";
import { EditVideoForm } from "./EditVideoForm";
import { EditModelForm } from "./EditModelForm";
import { CreateCategoryForm } from "./CreateCategoryForm";
import { CreateModelForm } from "./CreateModelForm";
import { BunnyImportForm } from "./BunnyImportForm";
import { TxtMetadataForm } from "./TxtMetadataForm";
import { AutoGenderButton } from "./AutoGenderButton";
import { ImportPhotoSetsForm } from "./ImportPhotoSetsForm";

async function createCategoryAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  if (name) {
    createCategory(name);
    revalidatePath("/categories");
    revalidatePath("/admin");
  }
}

async function createModelAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || undefined;
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || undefined;
  const galleryRaw = String(formData.get("gallery") ?? "").trim();
  const galleryUrls = galleryRaw.length > 0 ? parsePhotoUrls(galleryRaw) : undefined;
  const genderRaw = String(formData.get("gender") ?? "").trim();
  const gender = genderRaw === "female" || genderRaw === "male" ? genderRaw : undefined;
  if (name) {
    createModel(name, bio, avatarUrl, galleryUrls, gender);
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
  const galleryUrls = galleryRaw.length > 0 ? parsePhotoUrls(galleryRaw) : undefined;
  const active = String(formData.get("active") ?? "") === "true";
  const genderRaw = String(formData.get("gender") ?? "").trim();
  const gender = genderRaw === "female" || genderRaw === "male" ? genderRaw : undefined;
  if (!modelId || !stageName) return;
  updateModel(modelId, { stageName, bio, avatarUrl, galleryUrls, active, gender });
  revalidatePath("/");
  revalidatePath("/models");
  revalidatePath("/admin");
}

async function updateSiteBrandingAction(formData: FormData) {
  "use server";
  const siteName = String(formData.get("siteName") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim() || undefined;
  const heroBannerImageUrl = String(formData.get("heroBannerImageUrl") ?? "").trim() || undefined;
  const hideMalePerformersOnModelsPage = String(formData.get("hideMalePerformersOnModelsPage") ?? "") === "true";
  setSiteSettings({
    siteName: siteName || undefined,
    logoUrl,
    heroBannerImageUrl,
    hideMalePerformersOnModelsPage
  });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/models");
}

async function setSubscriptionAction(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId") ?? "");
  const planId = String(formData.get("planId") ?? "") || undefined;
  if (!userId) return;
  setUserSubscription(userId, planId);
  revalidatePath("/admin");
}

async function addVideoPhotosAction(formData: FormData) {
  "use server";
  const videoId = String(formData.get("videoId") ?? "").trim();
  const paste = String(formData.get("photoUrls") ?? "").trim();
  if (!videoId || !paste) return;
  const urls = parsePhotoUrls(paste);
  if (urls.length) addVideoPhotos(videoId, urls);
  revalidatePath("/admin");
  revalidatePath(`/videos/${videoId}`);
  revalidatePath(`/videos/${videoId}/photos`);
}

/** Browse a path in Bunny Storage and return folder names so the user can find the correct PhotoSets path. */
async function browseStoragePathAction(
  _prev: { path?: string; folders?: string[]; fileCount?: number; error?: string } | null,
  formData: FormData
) {
  "use server";
  const storageZoneName = String(formData.get("browseStorageZone") ?? "").trim() || "featurevideo-storage";
  const storageAccessKey = String(formData.get("browseStoragePassword") ?? "").trim();
  const storageHost = String(formData.get("browseStorageHost") ?? "").trim() || "storage.bunnycdn.com";
  const path = String(formData.get("browsePath") ?? "").trim();
  if (!storageAccessKey) return { error: "Storage password is required." };
  try {
    const items = await listBunnyStorageDir(storageZoneName, path, storageAccessKey, storageHost);
    const folders = (items || []).filter((i) => i.IsDirectory).map((i) => (i.ObjectName || "").replace(/\/$/, "")).filter(Boolean);
    const fileCount = (items || []).filter((i) => !i.IsDirectory).length;
    return { path: path || "(root)", folders, fileCount, error: undefined };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: message, path: path || "(root)", folders: [], fileCount: 0 };
  }
}

async function importPhotoSetsAction(
  _prev: { photosetsProcessed?: number; videosUpdated?: number; thumbnailsSet?: number; error?: string; errors?: string[] } | null,
  formData: FormData
) {
  "use server";
  const storageZoneName = String(formData.get("photosetsStorageZone") ?? "").trim() || "featurevideo-storage";
  const storageAccessKey = String(formData.get("photosetsStoragePassword") ?? "").trim();
  const storageHost = String(formData.get("photosetsStorageHost") ?? "").trim() || "storage.bunnycdn.com";
  const photosetsPath = String(formData.get("photosetsPath") ?? "").trim();
  const pullZoneHost = String(formData.get("photosetsPullZoneHost") ?? "").trim();
  const urlPrefix = String(formData.get("photosetsUrlPrefix") ?? "").trim() || undefined;
  const txtMetadata = String(formData.get("photosetsTxtMetadata") ?? "").trim() || undefined;
  if (!storageAccessKey || !pullZoneHost) {
    return { error: "Storage password and Pull zone host are required." };
  }
  try {
    const result = await importPhotoSetsFromBunny({
      storageZoneName,
      storageAccessKey,
      storageHost,
      photosetsPath,
      pullZoneHost,
      urlPrefix,
      txtMetadata,
    });
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/videos");
    return {
      photosetsProcessed: result.photosetsProcessed,
      videosUpdated: result.videosUpdated,
      thumbnailsSet: result.thumbnailsSet,
      errors: result.errors.length ? result.errors : undefined,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: message };
  }
}

async function addModelGalleryAction(formData: FormData) {
  "use server";
  const modelId = String(formData.get("modelId") ?? "").trim();
  const paste = String(formData.get("modelGalleryUrls") ?? "").trim();
  if (!modelId || !paste) return;
  const urls = parsePhotoUrls(paste);
  if (urls.length === 0) return;
  const models = getModels();
  const model = models.find((m) => m.id === modelId);
  if (!model) return;
  const existing = model.galleryUrls ?? [];
  const combined = [...existing];
  for (const url of urls) {
    if (!combined.includes(url)) combined.push(url);
  }
  updateModel(modelId, { galleryUrls: combined });
  revalidatePath("/admin");
  revalidatePath("/models");
  revalidatePath(`/models/${modelId}`);
}

async function importFromBunnyAction(
  _prev: { created?: number; total?: number; error?: string } | null,
  formData: FormData
) {
  "use server";
  const accessKey = String(formData.get("bunnyAccessKey") ?? "").trim();
  const libraryId = String(formData.get("bunnyLibraryId") ?? "").trim();
  const videoPullZone = String(formData.get("bunnyVideoPullZone") ?? "").trim();
  const thumbnailPullZone = String(formData.get("bunnyThumbnailPullZone") ?? "").trim();
  if (!accessKey || !libraryId || !videoPullZone) return { error: "Missing API key, Library ID, or Video pull zone." };
  try {
    const items = await fetchAllBunnyVideos(libraryId, accessKey);
    const existingUrls = new Set(getVideos(true).map((v) => v.videoUrl));
    let created = 0;
    const FINISHED = 4;
    for (const item of items) {
      if (item.status !== FINISHED || !item.guid || !item.title) continue;
      const videoUrl = buildBunnyHlsUrl(videoPullZone, item.guid);
      if (existingUrls.has(videoUrl)) continue;
      const thumbnailUrl = thumbnailPullZone
        ? buildBunnyThumbnailUrl(thumbnailPullZone, item.guid, item.thumbnailFileName)
        : undefined;
      createVideo({
        title: item.title,
        description: item.description ?? undefined,
        thumbnailUrl,
        videoUrl,
        categoryIds: [],
        modelIds: []
      });
      existingUrls.add(videoUrl);
      created++;
    }
    revalidatePath("/");
    revalidatePath("/videos");
    revalidatePath("/videos/trending");
    revalidatePath("/admin");
    return { created, total: items.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: message };
  }
}

async function autoCategorizeGendersAction() {
  "use server";
  const result = autoCategorizeModelGenders();
  revalidatePath("/models");
  revalidatePath("/admin");
  return result;
}

async function applyTxtMetadataAction(
  _prev: { videosUpdated?: number; modelsCreated?: number; categoriesCreated?: number; error?: string } | null,
  formData: FormData
) {
  "use server";
  const txt = String(formData.get("txtMetadata") ?? "").trim();
  if (!txt) return { error: "Paste TXT content first." };
  try {
    const entries = parseTxtMetadata(txt);
    const result = applyTxtMetadataToVideos(entries);
    revalidatePath("/");
    revalidatePath("/videos");
    revalidatePath("/admin");
    revalidatePath("/models");
    revalidatePath("/categories");
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: message };
  }
}

export default function AdminPage() {
  const site = getSiteSettings();
  const videos = getVideos(true);
  const models = getModels();
  const users = getUsers();

  return (
    <AgeGate>
      <SiteShell>
          <div className="mx-auto max-w-6xl px-4 py-8 space-y-12">
            <header className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight">Admin dashboard</h1>
              <p className="text-sm text-neutral-400 max-w-xl">
                Manage videos, models, categories, imports, and user subscriptions.
              </p>
              <nav className="flex flex-wrap gap-2 pt-2" aria-label="Admin sections">
                <a href="#settings" className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition">
                  Settings
                </a>
                <a href="#videos" className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition">
                  Videos
                </a>
                <a href="#models" className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition">
                  Models
                </a>
                <a href="#categories" className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition">
                  Categories
                </a>
                <a href="#import" className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition">
                  Import
                </a>
                <a href="#users" className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition">
                  Users
                </a>
              </nav>
            </header>

            {/* Site branding */}
            <section id="settings" className="scroll-mt-24 card-surface p-6 space-y-4 border-l-4 border-l-amber-500/50">
              <h2 className="text-lg font-semibold text-neutral-100">Site settings</h2>
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
                <div className="flex items-center gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    id="hideMalePerformersOnModelsPage"
                    name="hideMalePerformersOnModelsPage"
                    value="true"
                    defaultChecked={Boolean(site.hideMalePerformersOnModelsPage)}
                    className="h-4 w-4 rounded border-white/20 bg-black/70"
                  />
                  <input type="hidden" name="hideMalePerformersOnModelsPage" value="false" />
                  <label className="text-sm text-neutral-200" htmlFor="hideMalePerformersOnModelsPage">
                    Hide male performers on the models page
                  </label>
                </div>
                <button className="btn-gradient col-span-full sm:col-span-1 w-full sm:w-auto justify-center text-sm">
                  Save branding
                </button>
              </form>
            </section>

            <section id="videos" className="scroll-mt-24 space-y-6">
              <div className="card-surface p-6 space-y-6 border-l-4 border-l-pink-500/50">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-100">Videos</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Add, edit, and manage video galleries.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Add video</h3>
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
                      items={getCategories().map((cat) => ({ id: cat.id, label: cat.name }))}
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
                </div>

                <div className="pt-6 border-t border-white/10 space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Edit video</h3>
                  <EditVideoForm
                    videos={videos}
                    categories={getCategories()}
                    models={models}
                    updateVideoAction={updateVideoAction}
                  />
                </div>

                <div className="pt-6 border-t border-white/10 space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Photo galleries</h3>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-3">
                    <h4 className="text-xs font-medium text-neutral-400">Import from Bunny Storage</h4>
                    <ImportPhotoSetsForm action={importPhotoSetsAction} browseAction={browseStoragePathAction} />
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-4">
                    Or paste image URLs manually (one per line or comma-separated). Full URLs or short form: <code className="rounded bg-white/10 px-1">cdn.net/Folder%20pics/PhotoSets/HCPS0606/IMG_0002.JPG</code>
                  </p>
                  <form action={addVideoPhotosAction} className="space-y-3 text-sm">
                    <div className="space-y-1">
                      <label className="text-neutral-200">Video</label>
                      <select
                        name="videoId"
                        required
                        className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                      >
                        <option value="">— Select video —</option>
                        {videos.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-neutral-200">Photo URLs (one per line or comma-separated)</label>
                      <textarea
                        name="photoUrls"
                        rows={8}
                        placeholder={"https://Pull-Video-Load.b-cdn.net/Folder%20pics/PhotoSets/HCPS0606/IMG_0002.JPG\nhttps://Pull-Video-Load.b-cdn.net/Folder%20pics/PhotoSets/HCPS0606/IMG_0003.JPG\n\nOr short form:\ncdn.net/Folder%20pics/PhotoSets/HCPS0606/IMG_0002.JPG,cdn.net/Folder%20pics/PhotoSets/HCPS0606/IMG_0003.JPG"}
                        className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2 font-mono text-xs"
                      />
                    </div>
                    <button type="submit" className="btn-gradient justify-center text-sm px-4 py-2">
                      Add photos
                    </button>
                  </form>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">All videos — hide or remove</h3>
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
            </section>

            <section id="models" className="scroll-mt-24 space-y-6">
              <div className="card-surface p-6 space-y-6 border-l-4 border-l-violet-500/50">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-100">Models</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Roster, galleries, and gender.</p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Add model</h3>
                  <CreateModelForm action={createModelAction} />
                </div>

                <div className="pt-6 border-t border-white/10 space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Roster (click to toggle active)</h3>
                  <form action={toggleModelAction} className="space-y-2 text-xs">
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
                  </form>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Auto-categorize gender</h3>
                    <p className="text-[11px] text-neutral-400">
                      Set male/female for models that have no gender, using a built-in list of male names (first word of stage name).
                    </p>
                    <AutoGenderButton action={autoCategorizeGendersAction} />
                </div>

                <div className="pt-6 border-t border-white/10 space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Edit model</h3>
                    <EditModelForm models={models} updateModelAction={updateModelAction} />
                </div>

                <div className="pt-6 border-t border-white/10 space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Model gallery (paste URLs)</h3>
                  <p className="text-[11px] text-neutral-400">
                    Paste image URLs to append to a model&apos;s gallery (one per line or comma-separated). Full URLs or short form: <code className="rounded bg-white/10 px-1">cdn.net/.../IMG_0001.JPG</code>
                  </p>
                  <form action={addModelGalleryAction} className="space-y-3 text-sm">
                    <div className="space-y-1">
                      <label className="text-neutral-200">Model</label>
                      <select
                        name="modelId"
                        required
                        className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                      >
                        <option value="">— Select model —</option>
                        {models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.stageName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-neutral-200">Gallery URLs</label>
                      <textarea
                        name="modelGalleryUrls"
                        rows={6}
                        placeholder={"https://.../IMG_0002.JPG\nhttps://.../IMG_0003.JPG\n\nOr: cdn.net/Folder%20pics/PhotoSets/HCPS0606/IMG_0002.JPG,cdn.net/.../IMG_0003.JPG"}
                        className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2 font-mono text-xs"
                      />
                    </div>
                    <button type="submit" className="btn-gradient justify-center text-sm px-4 py-2">
                      Add to model gallery
                    </button>
                  </form>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-2">
                  <h3 className="text-sm font-semibold text-red-400/90 uppercase tracking-wider">Remove model</h3>
                  <form action={deleteModelAction} className="space-y-2 text-xs">
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
              </div>
            </section>

            <section id="categories" className="scroll-mt-24 card-surface p-6 space-y-4 border-l-4 border-l-emerald-500/50">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">Categories</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Add and view categories used on videos.</p>
              </div>
                  <CreateCategoryForm action={createCategoryAction} />
                  <div className="flex flex-wrap gap-2 text-[11px] text-neutral-200">
                    {getCategories().map((cat) => (
                      <span
                        key={cat.id}
                        className="rounded-full bg-white/5 px-3 py-1 text-xs text-neutral-100"
                      >
                        {cat.name}
                      </span>
                    ))}
                </div>
            </section>

            <section id="import" className="scroll-mt-24 card-surface p-6 space-y-6 border-l-4 border-l-sky-500/50">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">Import</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Bunny.net videos, TXT metadata, and PhotoSets from storage.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">1. Fetch videos from Bunny Stream</h3>
                <BunnyImportForm action={importFromBunnyAction} />
              </div>
              <div className="pt-6 border-t border-white/10 space-y-4">
                <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">2. Apply TXT metadata (performers & categories)</h3>
                <TxtMetadataForm action={applyTxtMetadataAction} />
              </div>
            </section>

            <section id="users" className="scroll-mt-24 card-surface p-6 space-y-4 border-l-4 border-l-amber-500/50">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">Users & subscriptions</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Assign or clear plans. All registered users appear here.</p>
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

