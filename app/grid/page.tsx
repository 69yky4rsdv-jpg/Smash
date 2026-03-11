import { getSession } from "@/lib/auth";
import {
  addGridCustomPhotos,
  getGridPhotoIds,
  getGridPhotos,
  parsePhotoUrls,
  removeGridPhoto,
  setGridPhotoIds,
} from "@/lib/data";
import { getSiteSettings } from "@/lib/site-settings";
import { revalidatePath } from "next/cache";
import { GridPageClient } from "./GridPageClient";

const MAX_GRID_PHOTOS = 30;

/** Dedupe ids preserving first occurrence order (fixes duplicate photos in grid). */
function dedupeIds(ids: string[]): string[] {
  const seen = new Set<string>();
  return ids.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

// Always load fresh grid data so newly added photos show up (no static cache)
export const dynamic = "force-dynamic";

async function saveGridPhotoIdsAction(formData: FormData) {
  "use server";
  const raw = formData.getAll("photoIds").map(String).filter(Boolean);
  const photoIds = [...new Set(raw)].slice(0, MAX_GRID_PHOTOS); // dedupe then cap (Set keeps insertion order)
  setGridPhotoIds(photoIds);
  revalidatePath("/grid");
}

async function addGridPhotosAction(formData: FormData): Promise<{ added: { id: string; url: string; videoId: string }[] }> {
  "use server";
  const paste = String(formData.get("photoUrls") ?? "").trim();
  if (!paste) return { added: [] };
  const urls = parsePhotoUrls(paste);
  if (urls.length === 0) return { added: [] };
  const added = addGridCustomPhotos(urls);
  revalidatePath("/grid");
  return { added };
}

async function removeGridPhotoAction(formData: FormData) {
  "use server";
  const id = String(formData.get("photoId") ?? "").trim();
  if (!id) return;
  removeGridPhoto(id);
  revalidatePath("/grid");
}

export default async function GridPage() {
  const { isAdmin } = await getSession();
  const site = getSiteSettings();
  const allPhotos = getGridPhotos();
  const savedIds = getGridPhotoIds();

  // When nothing saved: show first N photos from all. Otherwise use saved order. Dedupe to prevent duplicate photos.
  const defaultIds = allPhotos.slice(0, MAX_GRID_PHOTOS).map((p) => p.id);
  const rawIds = (savedIds.length > 0 ? savedIds : defaultIds).slice(0, MAX_GRID_PHOTOS);
  const selectedIds = dedupeIds(rawIds);
  // Preserve the saved order: map ids back to photos in id order.
  const displayedPhotos = selectedIds
    .map((id) => allPhotos.find((p) => p.id === id))
    .filter((p): p is ReturnType<typeof getGridPhotos>[number] => p != null);
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
        removePhotoAction={removeGridPhotoAction}
        maxPhotos={MAX_GRID_PHOTOS}
      />
    </>
  );
}
