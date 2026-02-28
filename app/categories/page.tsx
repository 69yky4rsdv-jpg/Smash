import SiteShell from "../(site)/Shell";
import { AgeGate } from "../(site)/AgeGate";
import { getCategories, getVideos } from "@/lib/data";
import Link from "next/link";
import { CategoriesGate } from "./CategoriesGate";

export default function CategoriesPage() {
  const videos = getVideos();
  return (
    <AgeGate>
      <SiteShell>
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
            <p className="text-sm text-neutral-300">
              Choose a category and search to browse videos.
            </p>
          </header>
          <CategoriesGate categories={getCategories()} videos={videos} />
        </div>
      </SiteShell>
    </AgeGate>
  );
}
