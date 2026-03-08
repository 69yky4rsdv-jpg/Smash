import Link from "next/link";
import { redirect } from "next/navigation";
import { GalleryWithLightbox } from "../../../(site)/GalleryWithLightbox";
import { getVideos, getVideoPhotoUrls } from "@/lib/data";
import { getSession } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function VideoPhotosPage({ params }: Props) {
  const { id } = await params;
  const videos = getVideos();
  const video = videos.find((v) => v.id === id);

  if (!video) {
    redirect("/videos");
  }

  const { isAdmin, hasSubscription } = await getSession();
  if (!isAdmin && !hasSubscription) {
    redirect("/pricing");
  }

  const photoUrls = getVideoPhotoUrls(video.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
            <header className="space-y-2">
              <Link
                href={`/videos/${video.id}`}
                className="text-xs text-accent-pinkSoft hover:text-accent-pink"
              >
                ← Back to scene
              </Link>
              <p className="text-xs text-accent-pinkSoft uppercase tracking-[0.18em]">
                Photos
              </p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {video.title}
              </h1>
            </header>

            {photoUrls.length === 0 ? (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-neutral-400">
                <p>No photos for this scene yet. Add them in the admin under Video photo galleries.</p>
              </section>
            ) : (
              <section className="space-y-2">
                <p className="text-xs text-neutral-500">Click any image to zoom</p>
                <GalleryWithLightbox
                  urls={photoUrls}
                  altPrefix={`${video.title} photo`}
                />
              </section>
            )}
          </div>
  );
}

