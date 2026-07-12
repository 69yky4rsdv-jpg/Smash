import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStoreVideos, recordStoreVideoPurchase } from "@/lib/data";
import { StorePurchaseAccessForm } from "../StorePurchaseAccessForm";

type Props = {
  searchParams: Promise<{ videoId?: string | string[] }>;
};

export const dynamic = "force-dynamic";

function parseVideoId(raw: string | string[] | undefined): string | undefined {
  if (!raw) return undefined;
  const id = (Array.isArray(raw) ? raw[0] : raw).trim();
  return id || undefined;
}

export default async function StorePurchaseSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const videoId = parseVideoId(params.videoId);
  const { user } = await getSession();

  if (!videoId) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-semibold text-white">Purchase received</h1>
        <p className="text-sm text-neutral-300">
          We could not match this payment to a video. The success link may be missing{" "}
          <code className="text-amber-200">?videoId=...</code> in Stripe.
        </p>
      </div>
    );
  }

  const video = getStoreVideos().find((item) => item.id === videoId);
  if (!video) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-semibold text-white">Purchase received</h1>
        <p className="text-sm text-neutral-300">
          Payment succeeded, but this video was not found on the server ({videoId}). An admin may need to
          sync <code className="text-amber-200">store-videos.json</code> to production.
        </p>
      </div>
    );
  }

  if (user) {
    recordStoreVideoPurchase(user.id, videoId);
    redirect(`/store/${videoId}/watch`);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:py-14">
      <StorePurchaseAccessForm videoId={videoId} videoTitle={video.title} />
    </div>
  );
}
