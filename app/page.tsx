import SiteShell from "./(site)/Shell";
import { AgeGate } from "./(site)/AgeGate";
import { getVideos, subscriptionPlans } from "@/lib/data";
import { getSiteSettings } from "@/lib/site-settings";
import Link from "next/link";
import { JoinNowButton } from "./(site)/JoinNowButton";

export default function HomePage() {
  const site = getSiteSettings();
  const videos = getVideos();
  const latest = videos.slice(0, 3);
  const trending = videos.filter(
    (v) => v.isTrending || (v.categories && v.categories.includes("trending"))
  );

  return (
    <AgeGate>
      <SiteShell>
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-12">
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

          {/* Latest Videos — traditional video layout */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Latest videos</h2>
              <Link
                href="/videos"
                className="text-xs text-accent-pinkSoft hover:text-accent-pink"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((video) => (
                <Link key={video.id} href={`/videos/${video.id}`} className="group">
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-tr from-pink-500/30 via-black to-pink-700/40" />
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-neutral-100 line-clamp-2 group-hover:text-accent-pinkSoft">
                    {video.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Trending — traditional video layout */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Trending videos</h2>
              <Link
                href="/videos/trending"
                className="text-xs text-accent-pinkSoft hover:text-accent-pink"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trending.map((video) => (
                <Link key={video.id} href={`/videos/${video.id}`} className="group">
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-tr from-pink-500/30 via-black to-pink-700/40" />
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-neutral-100 line-clamp-2 group-hover:text-accent-pinkSoft">
                    {video.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </section>

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
      </SiteShell>
    </AgeGate>
  );
}

