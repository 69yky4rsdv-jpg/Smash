import { AgeGate } from "../(site)/AgeGate";
import { SubscriptionGate } from "../(site)/SubscriptionGate";
import { getVideos, getUsers } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-server";
import Link from "next/link";
import { VideosListClient } from "./VideosListClient";

export default async function AllVideosPage() {
  const videos = getVideos();
  const userId = await getAuthUserId();
  const user = getUsers().find((u) => u.id === userId);
  const isAdmin = user?.role === "admin" || userId === "admin";
  const hasSubscription =
    (!!user && (user.role === "admin" || !!user.subscriptionPlanId)) || userId === "admin";

  return (
    <AgeGate>
      <SubscriptionGate initialHasAccess={hasSubscription} skipGate={isAdmin}>
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">All videos</h1>
            <p className="text-sm text-neutral-300">
              Browse the full catalog. Click any thumbnail to open the scene page.
            </p>
          </header>
          <VideosListClient videos={videos} />

          {/* Affiliate sign up */}
          <section className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <h2 className="text-lg font-semibold text-neutral-100">Become an affiliate</h2>
            <p className="mt-2 max-w-xl mx-auto text-sm text-neutral-400">
              Earn recurring revenue by promoting our library. High payouts, real-time stats, and
              branded creatives.
            </p>
            <Link
              href="/affiliate"
              className="btn-gradient mt-4 inline-flex text-sm px-6 py-2"
            >
              Affiliate sign up
            </Link>
          </section>
        </div>
      </SubscriptionGate>
    </AgeGate>
  );
}

