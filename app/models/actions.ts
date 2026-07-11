"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { toggleModelFavorite } from "@/lib/model-favorites";

export async function toggleModelFavoriteAction(modelId: string) {
  const { user } = await getSession();
  if (!user || !modelId) {
    throw new Error("Sign in to favorite models.");
  }

  const result = toggleModelFavorite(user.id, modelId);
  revalidatePath("/models");
  revalidatePath(`/models/${modelId}`);
  revalidatePath("/profile");
  return result;
}
