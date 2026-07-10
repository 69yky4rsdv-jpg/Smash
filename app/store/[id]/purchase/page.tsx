import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

/** Legacy URL — forwards to checkout (Stripe redirect). */
export default async function StorePurchasePage({ params }: Props) {
  const { id } = await params;
  redirect(`/store/${id}/checkout`);
}
