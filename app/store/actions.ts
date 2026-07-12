"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readNextPath } from "@/lib/action-errors";
import { authenticate, registerUser, setAuthSession } from "@/lib/auth";
import { getStoreVideos, recordStoreVideoPurchase } from "@/lib/data";

export async function registerStoreUserAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const unlockVideoId = String(formData.get("unlockVideoId") ?? "").trim();

  if (!email || !password) {
    throw new Error("missing");
  }

  let user;
  try {
    user = registerUser(email, password);
  } catch {
    throw new Error("exists");
  }

  await setAuthSession(user.id, user.role);

  if (unlockVideoId) {
    const video = getStoreVideos().find((item) => item.id === unlockVideoId);
    if (video) {
      recordStoreVideoPurchase(user.id, unlockVideoId);
      revalidatePath("/store");
      revalidatePath(`/store/${unlockVideoId}`);
      revalidatePath(`/store/${unlockVideoId}/watch`);
      redirect(`/store/${unlockVideoId}/watch`);
    }
  }

  redirect(readNextPath(formData, "/store"));
}

export async function loginAfterStorePurchaseAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const videoId = String(formData.get("videoId") ?? "").trim();

  if (!email || !password) {
    throw new Error("missing");
  }

  const user = authenticate(email, password);
  if (!user) {
    throw new Error("invalid");
  }

  await setAuthSession(user.id, user.role);

  if (videoId) {
    const video = getStoreVideos().find((item) => item.id === videoId);
    if (video) {
      recordStoreVideoPurchase(user.id, videoId);
      revalidatePath("/store");
      revalidatePath(`/store/${videoId}`);
      revalidatePath(`/store/${videoId}/watch`);
      redirect(`/store/${videoId}/watch`);
    }
  }

  redirect(readNextPath(formData, "/store"));
}

export async function completeStorePurchaseAction(videoId: string): Promise<{ ok: boolean; error?: string }> {
  const { getSession } = await import("@/lib/auth");
  const { getStoreVideos } = await import("@/lib/data");
  const { user } = await getSession();

  if (!user) {
    return { ok: false, error: "not_logged_in" };
  }

  const video = getStoreVideos().find((v) => v.id === videoId);
  if (!video) {
    return { ok: false, error: "video_not_found" };
  }

  recordStoreVideoPurchase(user.id, videoId);
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/store");
  revalidatePath(`/store/${videoId}`);
  revalidatePath(`/store/${videoId}/watch`);
  return { ok: true };
}
