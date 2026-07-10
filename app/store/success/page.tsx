import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getStoreVideos, recordStoreVideoPurchase } from "@/lib/data";

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
        <Link href="/store" className="btn-gradient inline-flex justify-center text-sm py-2 px-6">
          Back to store
        </Link>
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
        <Link href="/store" className="btn-gradient inline-flex justify-center text-sm py-2 px-6">
          Back to store
        </Link>
      </div>
    );
  }

  if (user) {
    recordStoreVideoPurchase(user.id, videoId);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 text-center space-y-6">
      <p className="text-xs uppercase tracking-[0.18em] text-accent-pinkSoft">Purchase complete</p>
      <h1 className="text-2xl font-semibold text-white">Thank you!</h1>
      <p className="text-sm text-neutral-300">
        {user ? (
          <>
            Your account now has access to <span className="text-white">{video.title}</span>.
          </>
        ) : (
          <>
            Create an account or log in with the same email you used at checkout to unlock{" "}
            <span className="text-white">{video.title}</span>.
          </>
        )}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {user ? (
          <Link href={`/store/${videoId}/watch`} className="btn-gradient justify-center text-sm py-2 px-6">
            Watch full video
          </Link>
        ) : (
          <>
            <Link href={`/store/${videoId}/signup`} className="btn-gradient justify-center text-sm py-2 px-6">
              Create free account
            </Link>
            <Link
              href={`/auth/login?next=/store/${videoId}/watch`}
              className="rounded-full border border-white/15 px-6 py-2 text-sm text-neutral-200 hover:bg-white/5"
            >
              Log in
            </Link>
          </>
        )}
        <Link
          href="/store"
          className="rounded-full border border-white/15 px-6 py-2 text-sm text-neutral-200 hover:bg-white/5"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}
