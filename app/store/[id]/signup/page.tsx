import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStoreVideos, userHasPurchasedStoreVideo } from "@/lib/data";
import { StoreSignupForm } from "../../StoreSignupForm";

function getVideoStorePrice(videoId: string): number {
  const hash = Array.from(videoId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const tiers = [14.99, 17.99, 19.99, 22.99, 24.99, 27.99];
  return tiers[hash % tiers.length]!;
}

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function StoreSignupPage({ params }: Props) {
  const { id } = await params;
  const { user, isAdmin } = await getSession();
  const video = getStoreVideos().find((item) => item.id === id);

  if (!video) {
    redirect("/store");
  }

  if (user) {
    if (userHasPurchasedStoreVideo(user.id, id, isAdmin)) {
      redirect(`/store/${id}/watch`);
    }
    const checkoutUrl = video.purchaseCheckoutUrl?.trim();
    redirect(checkoutUrl || `/store/${id}/checkout`);
  }

  const price = `$${getVideoStorePrice(video.id).toFixed(2)}`;

  return (
    <StoreSignupForm
      videoId={video.id}
      videoTitle={video.title}
      price={price}
      checkoutUrl={video.purchaseCheckoutUrl}
    />
  );
}
