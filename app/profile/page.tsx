import { redirect } from "next/navigation";
import { getModels, getVideos } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { getUserFavoriteModelIds } from "@/lib/model-favorites";
import { getUserLikedVideoIds } from "@/lib/video-engagement";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const { user } = await getSession();
  if (!user) redirect("/auth/login");

  const videos = getVideos(true);
  const models = getModels();
  const likedVideoIds = getUserLikedVideoIds(user.id);
  const favoriteModelIds = getUserFavoriteModelIds(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ProfileClient
        videos={videos}
        models={models}
        likedVideoIds={likedVideoIds}
        favoriteModelIds={favoriteModelIds}
      />
    </div>
  );
}
