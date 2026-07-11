import { getModels, getVideos } from "@/lib/data";
import { getSiteSettings } from "@/lib/site-settings";
import { getSession } from "@/lib/auth";
import { getUserFavoriteModelIds } from "@/lib/model-favorites";
import { getEngagementForModels } from "@/lib/video-engagement";
import { ModelsGridClient } from "./ModelsGridClient";

export default async function ModelsPage() {
  const allModels = getModels();
  const { hideMalePerformersOnModelsPage } = getSiteSettings();
  const models = hideMalePerformersOnModelsPage
    ? allModels.filter((m) => m.gender !== "male")
    : allModels;

  const videos = getVideos();
  const engagementByModelId = getEngagementForModels(
    models.map((m) => m.id),
    videos
  );

  const { user } = await getSession();
  const favoriteModelIds = user ? getUserFavoriteModelIds(user.id) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Models</h1>
        <p className="text-sm text-neutral-300">
          Meet the stars of VelvetStream. Tap the heart to favorite a model — like % is averaged
          across their scenes.
        </p>
      </header>
      <ModelsGridClient
        models={models}
        engagementByModelId={engagementByModelId}
        favoriteModelIds={favoriteModelIds}
        isLoggedIn={!!user}
      />
    </div>
  );
}
