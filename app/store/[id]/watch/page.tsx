import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStoreVideos, recordStoreVideoPurchase, userHasPurchasedStoreVideo } from "@/lib/data";
import { normalizeStoreMediaUrl } from "@/lib/store-media-url";
import { StorePreviewMedia } from "../../StorePreviewMedia";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function StoreWatchPage({ params }: Props) {
  const { id } = await params;
  const { user, isAdmin } = await getSession();
  const video = getStoreVideos().find((item) => item.id === id);

  if (!video) {
    redirect("/store");
  }

  if (!user) {
    redirect(`/store/${id}/signup`);
  }

  if (!userHasPurchasedStoreVideo(user.id, id, isAdmin)) {
    redirect(`/store/${id}/purchase`);
  }

  const fullSrc = normalizeStoreMediaUrl(video.videoUrl);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-4 sm:py-10 space-y-6">
      <header className="space-y-2">
        <Link href="/store" className="text-xs text-accent-pinkSoft hover:text-accent-pink">
          ← Back to store
        </Link>
        <p className="text-xs text-accent-pinkSoft uppercase tracking-[0.18em]">Your purchase</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{video.title}</h1>
      </header>

      <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-tr from-pink-500/20 via-black to-pink-700/40">
        <StorePreviewMedia
          key={fullSrc}
          src={fullSrc}
          poster={video.thumbnailUrl}
          className="h-full w-full"
          showErrors={isAdmin}
        />
      </div>
    </div>
  );
}
