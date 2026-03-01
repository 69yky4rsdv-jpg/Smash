import { cookies } from "next/headers";
import { AgeGate } from "../(site)/AgeGate";
import { getCategories, getVideos, getUsers } from "@/lib/data";
import { CategoriesGate } from "./CategoriesGate";

export default async function CategoriesPage() {
  const videos = getVideos();
  const cookieStore = await cookies();
  const userId = cookieStore.get("vs_userId")?.value?.trim() ?? "";
  const user = getUsers().find((u) => u.id === userId);
  const initialLoggedIn = !!user || !!userId;
  const isAdmin = user?.role === "admin" || userId === "admin";

  return (
    <AgeGate>
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
          initialLoggedIn={initialLoggedIn}
          skipGate={isAdmin}
        />
      </div>
    </AgeGate>
  );
}
