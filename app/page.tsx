import { getVideos, subscriptionPlans } from "@/lib/data";
import { getSiteSettings } from "@/lib/site-settings";
import Image from "next/image";
import Link from "next/link";
import { JoinNowButton } from "./(site)/JoinNowButton";
import { HomeVideoGrids } from "./HomeVideoGrids";

const LOGO_SRC = "/logo/smashpov-logo-cropped.png";

export default function HomePage() {
  const site = getSiteSettings();
  const videos = getVideos();
  const featured = videos.filter((v) => v.categories?.includes("featured"));
  const latest = (featured.length > 0 ? featured : videos).slice(0, 12);
  const trending = videos.filter(
    (v) => v.isTrending || (v.categories && v.categories.includes("trending"))
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-6 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-8 space-y-8">
      <section className="space-y-4 text-center">
        <Image
          src={LOGO_SRC}
          alt={site.siteName}
          width={292}
          height={48}
          className="mx-auto h-12 w-auto object-contain"
          priority
        />
        <p className="text-sm font-medium text-accent-pinkSoft md:text-base">
          Join thousands watching exclusive scenes
        </p>
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
          Unlimited full scenes — one low price
        </h2>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-neutral-400">
          HD streaming on any device · New exclusives every week · Licensed performers ·
          Start watching in under a minute · Cancel anytime, no hassle
        </p>
        <JoinNowButton />
      </section>

      <HomeVideoGrids latest={latest} trending={trending} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Membership plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {subscriptionPlans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col ${
                plan.highlight ? "ring-2 ring-accent-pink/70" : ""
              }`}
            >
              {plan.highlight && (
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-accent-pink">
                  Best value
                </p>
              )}
              <h3 className="text-sm font-semibold text-neutral-100">{plan.name}</h3>
              <p className="mt-2 text-2xl font-bold">
                ${plan.pricePerMonth.toFixed(2)}
                <span className="text-xs font-normal text-neutral-400"> / month</span>
              </p>
              <p className="mt-1 text-[11px] text-neutral-400">{plan.billingLabel}</p>
              <Link
                href={plan.checkoutUrl ?? "/auth/register"}
                className="btn-gradient mt-4 flex min-h-[44px] w-full items-center justify-center py-2.5 text-xs"
                {...(plan.checkoutUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                Choose plan
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
