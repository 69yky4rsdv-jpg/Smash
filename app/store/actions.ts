"use server";

import { redirect } from "next/navigation";
import { readNextPath } from "@/lib/action-errors";
import { registerUser, setAuthSession } from "@/lib/auth";
import { recordStoreVideoPurchase } from "@/lib/data";

export async function registerStoreUserAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

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
