"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  getVideoEngagement,
  recordVideoView,
  toggleVideoLike,
  userHasLikedVideo,
} from "@/lib/video-engagement";

export async function recordVideoViewAction(videoId: string) {
  const { user } = await getSession();
  if (!user || !videoId) {
    return getVideoEngagement(videoId);
  }

  const engagement = recordVideoView(user.id, videoId);
  revalidatePath(`/videos/${videoId}`);
  return engagement;
}

export async function toggleVideoLikeAction(videoId: string) {
  const { user } = await getSession();
  if (!user || !videoId) {
    throw new Error("Sign in to like videos.");
  }

  const result = toggleVideoLike(user.id, videoId);
  revalidatePath(`/videos/${videoId}`);
  revalidatePath("/videos");
  revalidatePath("/profile");
  return result;
}

export async function getVideoLikeStateAction(videoId: string) {
  const { user } = await getSession();
  return {
    liked: user ? userHasLikedVideo(user.id, videoId) : false,
    engagement: getVideoEngagement(videoId),
  };
}
