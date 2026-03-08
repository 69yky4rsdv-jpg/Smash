import { subscriptionPlans } from "@/lib/data";
import { getSiteSettings } from "@/lib/site-settings";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PaymentLogos } from "./PaymentLogos";
import { PlanCards } from "./PlanCards";
import { PlanPageClient } from "./PlanPageClient";

export default async function StartPlanPage() {
  const site = getSiteSettings();
  const cookieStore = await cookies();
  const pendingEmail = cookieStore.get("vs_pending_email")?.value ?? "";
  if (!pendingEmail) {
    redirect("/start");
  }

  const weekly = subscriptionPlans.find((p) => p.id === "weekly");
  const monthly = subscriptionPlans.find((p) => p.id === "monthly");
  const overrides = site.planDisplayOverrides;
  const applyOverrides = <T extends { id: string; name: string; pricePerMonth: number; billingLabel: string }>(p: T): T => {
    const o = overrides?.[p.id];
    if (!o) return p;
    return {
      ...p,
      ...(o.name !== undefined && o.name !== "" && { name: o.name }),
      ...(o.pricePerMonth !== undefined && { pricePerMonth: o.pricePerMonth }),
      ...(o.billingLabel !== undefined && o.billingLabel !== "" && { billingLabel: o.billingLabel })
    };
  };
  const plans = [weekly, monthly].filter(Boolean).map(applyOverrides) as typeof subscriptionPlans;
  const freeTrialStickerText = site.freeTrialStickerText ?? "Free 7 days";

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <header className="relative z-10 px-4 pt-8 pb-4 text-center">
        <h1 className="text-4xl font-bold uppercase tracking-[0.25em] text-white drop-shadow-lg md:text-5xl">
          {site.siteName}
        </h1>
        <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
          Discover new releases
        </p>
        <p className="mt-1 text-sm font-medium uppercase tracking-[0.2em] text-white/95">
          Sign up today!
        </p>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-pink-400">
          Step 2
        </p>
        <h2 className="mt-1 text-xl font-semibold uppercase tracking-wide text-white">
          Choose your membership
        </h2>

        <PaymentLogos />

        <PlanCards plans={plans} freeTrialStickerText={freeTrialStickerText} />

        <p className="mt-4 text-[11px] leading-relaxed text-neutral-500">
          *After free week access, you will be charged according to the plan until you cancel.
          <br />
          **Where applicable, sales tax may be added to your purchase.
        </p>

        <PlanPageClient pendingEmail={pendingEmail} />
      </div>
    </div>
  );
}
