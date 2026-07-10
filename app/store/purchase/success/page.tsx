import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ videoId?: string | string[] }>;
};

export const dynamic = "force-dynamic";

/** Legacy Stripe URLs — forwards to /store/success */
export default async function LegacyStorePurchaseSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params.videoId;
  const videoId = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  const qs = videoId ? `?videoId=${encodeURIComponent(videoId)}` : "";
  redirect(`/store/success${qs}`);
}
