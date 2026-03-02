import { AgeGate } from "../(site)/AgeGate";
import { SubscriptionGate } from "../(site)/SubscriptionGate";
import { getCategories, getVideos, getUsers } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-server";
import { CategoriesGate } from "./CategoriesGate";

export default async function CategoriesPage() {
  const videos = getVideos();
  const userId = await getAuthUserId();
  const user = getUsers().find((u) => u.id === userId);
  const isAdmin = user?.role === "admin" || userId === "admin";
  const hasSubscription =
    (!!user && (user.role === "admin" || !!user.subscriptionPlanId)) || userId === "admin";

  return (
    <AgeGate>
      <SubscriptionGate initialHasAccess={hasSubscription} skipGate={isAdmin}>
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
            <p className="text-sm text-neutral-300">
              Choose a category and search to browse videos.
            </p>
          </header>
          <CategoriesGate
            categories={getCategories()}
            videos={videos}
          />
        </div>
      </SubscriptionGate>
    </AgeGate>
  );
}
