import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStoreVideos, userHasPurchasedStoreVideo } from "@/lib/data";
import { getStoreVideoPrice } from "@/lib/store-checkout";
import { StoreSignupForm } from "../../StoreSignupForm";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ purchased?: string }>;
};

export const dynamic = "force-dynamic";

export default async function StoreSignupPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { purchased: purchasedParam } = await searchParams;
  const purchased = purchasedParam === "1";
  const { user, isAdmin } = await getSession();
  const video = getStoreVideos().find((item) => item.id === id);

  if (!video) {
    redirect("/store");
  }

  if (user) {
    if (userHasPurchasedStoreVideo(user.id, id, isAdmin)) {
      redirect(`/store/${id}/watch`);
    }
    if (purchased) {
      redirect(`/store/success?videoId=${id}`);
    }
    const checkoutUrl = video.purchaseCheckoutUrl?.trim();
    redirect(checkoutUrl || `/store/${id}/checkout`);
  }

  const price = `$${getStoreVideoPrice(video).toFixed(2)}`;

  return (
    <StoreSignupForm
      videoId={video.id}
      videoTitle={video.title}
      price={price}
      checkoutUrl={video.purchaseCheckoutUrl}
      purchased={purchased}
    />
  );
}
