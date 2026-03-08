import { getSession } from "@/lib/auth";
import {
  addGridCustomPhotos,
  getGridPhotoIds,
  getGridPhotos,
  parsePhotoUrls,
  setGridPhotoIds,
} from "@/lib/data";
import { getSiteSettings } from "@/lib/site-settings";
import { revalidatePath } from "next/cache";
import { GridPageClient } from "./GridPageClient";

const MAX_GRID_PHOTOS = 30;

async function saveGridPhotoIdsAction(formData: FormData) {
  "use server";
  const photoIds = formData.getAll("photoIds").map(String).filter(Boolean);
  setGridPhotoIds(photoIds.slice(0, MAX_GRID_PHOTOS));
  revalidatePath("/grid");
}

async function addGridPhotosAction(formData: FormData) {
  "use server";
  const paste = String(formData.get("photoUrls") ?? "").trim();
  if (!paste) return;
  const urls = parsePhotoUrls(paste);
  if (urls.length) {
    addGridCustomPhotos(urls);
    revalidatePath("/grid");
  }
}

export default async function GridPage() {
  const { isAdmin } = await getSession();
  const site = getSiteSettings();
  const allPhotos = getGridPhotos();
  const savedIds = getGridPhotoIds();

  // Default: show one photo per video (thumbnail) when nothing saved yet. Cap at 30.
  const defaultIds =
    savedIds.length > 0
      ? savedIds
      : allPhotos.filter((p) => p.id === p.videoId).map((p) => p.id);
  const selectedIds = (savedIds.length > 0 ? savedIds : defaultIds).slice(0, MAX_GRID_PHOTOS);
  const displayedPhotos = allPhotos.filter((p) => selectedIds.includes(p.id));
  const preloadUrls = displayedPhotos.slice(0, 6).map((p) => p.url);

  return (
    <>
      {preloadUrls.map((url) => (
        <link key={url} rel="preload" href={url} as="image" />
      ))}
      <GridPageClient
        siteName={site.siteName}
        allPhotos={allPhotos}
        selectedIds={selectedIds}
        isAdmin={isAdmin}
        saveAction={saveGridPhotoIdsAction}
        addPhotosAction={addGridPhotosAction}
        maxPhotos={MAX_GRID_PHOTOS}
      />
    </>
  );
}
