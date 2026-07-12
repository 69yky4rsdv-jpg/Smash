import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStoreVideos, userHasPurchasedStoreVideo } from "@/lib/data";
import { getStorePurchaseSuccessUrl } from "@/lib/store-checkout";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

/** Redirect straight to Stripe. Login happens on the success page after payment. */
export default async function StoreCheckoutPage({ params }: Props) {
  const { id } = await params;
  const { user, isAdmin } = await getSession();
  const video = getStoreVideos().find((item) => item.id === id);

  if (!video) {
    redirect("/store");
  }

  if (user && userHasPurchasedStoreVideo(user.id, id, isAdmin)) {
    redirect(`/store/${id}/watch`);
  }

  const checkoutUrl = video.purchaseCheckoutUrl?.trim();
  if (checkoutUrl) {
    redirect(checkoutUrl);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 space-y-4 text-center">
      <h1 className="text-xl font-semibold text-white">Checkout not ready</h1>
      <p className="text-sm text-neutral-300">
        Stripe checkout is not configured for <span className="text-white">{video.title}</span> yet.
      </p>
      {isAdmin ? (
        <p className="text-xs text-neutral-400 break-all">
          Add a payment link in the store admin. Success URL:{" "}
          <code className="text-amber-200">{getStorePurchaseSuccessUrl(id)}</code>
        </p>
      ) : null}
      <Link href={`/store/${id}`} className="btn-gradient inline-flex justify-center text-sm py-2 px-6">
        Back to preview
      </Link>
    </div>
  );
}
