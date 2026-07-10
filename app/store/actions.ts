"use server";

import { revalidatePath } from "next/cache";
import { registerUser, setAuthSession } from "@/lib/auth";
import { recordStoreVideoPurchase } from "@/lib/data";

export async function registerStoreUserAction(formData: FormData): Promise<{ id: string; role: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    throw new Error("missing");
  }

  try {
    const user = registerUser(email, password);
    await setAuthSession(user.id, user.role);
    return { id: user.id, role: user.role };
  } catch {
    throw new Error("exists");
  }
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
  revalidatePath("/store");
  revalidatePath(`/store/${videoId}`);
  revalidatePath(`/store/${videoId}/watch`);
  return { ok: true };
}
