import SiteShell from "../(site)/Shell";
import { AgeGate } from "../(site)/AgeGate";

export default function AffiliatePage() {
  return (
    <AgeGate>
      <SiteShell>
        <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
          <header className="space-y-3 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Become a <span className="text-accent-pink">SmashPOV</span> affiliate
            </h1>
            <p className="text-sm text-neutral-300">
              Earn recurring revenue by promoting our premium library. High conversions, generous
              rev-share, real-time stats.
            </p>
          </header>

          <section className="grid gap-4 sm:grid-cols-3 text-sm">
            <div className="card-surface p-4">
              <p className="font-semibold mb-2">High payouts</p>
              <p className="text-neutral-300 text-xs">
                Competitive rev-share on every subscription you refer, with lifetime tracking.
              </p>
            </div>
            <div className="card-surface p-4">
              <p className="font-semibold mb-2">Beautiful creatives</p>
              <p className="text-neutral-300 text-xs">
                Access to branded banners, email kits, and promo pages optimized for adult traffic.
              </p>
            </div>
            <div className="card-surface p-4">
              <p className="font-semibold mb-2">Real-time stats</p>
              <p className="text-neutral-300 text-xs">
                Track clicks, signups, and earnings with a dedicated dashboard.
              </p>
            </div>
          </section>

          <section className="card-surface p-6 space-y-4">
            <h2 className="text-lg font-semibold">Affiliate sign up</h2>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <label htmlFor="name" className="text-neutral-200">
                    Name / alias
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    placeholder="Your display name"
                  />
                </div>
                <div className="space-y-1 text-sm">
                  <label htmlFor="email" className="text-neutral-200">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <label htmlFor="site" className="text-neutral-200">
                  Website / traffic source
                </label>
                <input
                  id="site"
                  name="site"
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                  placeholder="Where will you promote us?"
                />
              </div>
              <div className="space-y-1 text-sm">
                <label htmlFor="notes" className="text-neutral-200">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
                  placeholder="Tell us about your audience, experience, or questions."
                />
              </div>
              <button className="btn-gradient w-full justify-center text-sm">
                Submit affiliate application
              </button>
              <p className="text-[11px] text-neutral-500">
                For demo purposes this form does not send real emails yet; wire it to your affiliate
                platform or CRM when you are ready.
              </p>
              <p className="text-[11px] text-neutral-500">
                For record-keeping information, see our{" "}
                <a href="/2257" className="text-accent-pink hover:text-accent-pinkSoft">
                  18 U.S.C. § 2257 statement
                </a>
                .
              </p>
            </form>
          </section>
        </div>
      </SiteShell>
    </AgeGate>
  );
}

