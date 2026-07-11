"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getVideos, updateVideo } from "@/lib/data";
import { createCategory, deleteCategories } from "@/lib/admin";

export async function createCategoryAction(formData: FormData) {
  const { isAdmin } = await getSession();
  if (!isAdmin) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  createCategory(name);
  revalidatePath("/categories");
}

export async function clearAllVideoCategoriesAction() {
  const { isAdmin } = await getSession();
  if (!isAdmin) return;

  const videos = getVideos(true);
  for (const v of videos) {
    if (v.categories && v.categories.length > 0) {
      updateVideo(v.id, { categories: [] });
    }
  }
  revalidatePath("/");
  revalidatePath("/videos");
  revalidatePath("/videos/trending");
  revalidatePath("/categories");
}

export async function deleteCategoriesAction(formData: FormData) {
  const { isAdmin } = await getSession();
  if (!isAdmin) return;

  const raw = formData.getAll("categoryIds").map(String).filter(Boolean);
  if (!raw.length) return;

  const ids = raw.slice(0, 30);
  deleteCategories(ids);
  revalidatePath("/");
  revalidatePath("/videos");
  revalidatePath("/videos/trending");
  revalidatePath("/categories");
}
