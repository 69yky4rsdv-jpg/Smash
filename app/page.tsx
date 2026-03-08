import { getVideos, subscriptionPlans } from "@/lib/data";
import { getSiteSettings } from "@/lib/site-settings";
import Link from "next/link";
import { JoinNowButton } from "./(site)/JoinNowButton";
import { HomeVideoGrids } from "./HomeVideoGrids";

export default function HomePage() {
  const site = getSiteSettings();
  const videos = getVideos();
  const featured = videos.filter((v) => v.categories?.includes("featured"));
  const latest = (featured.length > 0 ? featured : videos).slice(0, 3);
  const trending = videos.filter(
    (v) => v.isTrending || (v.categories && v.categories.includes("trending"))
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 py-10 space-y-12">
          {/* Hero banner image — 1/3 size */}
          <section className="overflow-hidden rounded-xl">
            <div className="h-32 w-full overflow-hidden bg-gradient-to-tr from-pink-500/20 via-black to-pink-700/20 md:h-48">
              {site.heroBannerImageUrl ? (
                <img
                  src={site.heroBannerImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
          </section>

          {/* Join now — conversion-focused CTA */}
          <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent p-8 text-center md:p-10">
            <p className="text-sm font-medium text-accent-pinkSoft md:text-base">
              Start watching in seconds
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Unlimited access to the full library
            </h2>
            <JoinNowButton />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-400 md:gap-10">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                4K streaming
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Full content library
              </span>
            </div>
          </section>

          <HomeVideoGrids latest={latest} trending={trending} />

          {/* All plans */}
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
                    className="btn-gradient mt-4 w-full justify-center text-xs py-2"
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

