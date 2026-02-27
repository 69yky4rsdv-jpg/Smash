"use client";

import type { SubscriptionPlan } from "@/lib/types";
import { useEffect, useState } from "react";

type Props = {
  plans: SubscriptionPlan[];
  updatePlanAction: (formData: FormData) => Promise<void>;
};

export function PricingAdminControls({ plans, updatePlanAction }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const raw = document.cookie ?? "";
    const match = raw.match(/vs_userId=([^;]+)/);
    const userId = match ? decodeURIComponent(match[1]) : null;
    if (userId === "admin") {
      setIsAdmin(true);
    }
  }, []);

  if (!isAdmin) return null;

  return (
    <section className="mt-8 space-y-3 rounded-2xl border border-accent-pink/30 bg-accent-pink/5 p-4 text-xs text-neutral-200">
      <h2 className="text-sm font-semibold text-neutral-50">Admin: adjust plan pricing</h2>
      <p className="text-[11px] text-neutral-400">
        These changes update the pricing display only for this running instance. For production, also
        update your Stripe Payment Links to match.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((plan) => (
          <form
            key={plan.id}
            action={updatePlanAction}
            className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-3"
          >
            <input type="hidden" name="planId" value={plan.id} />
            <p className="text-xs font-semibold text-neutral-100">{plan.name}</p>
            <div className="space-y-1">
              <label className="text-[11px] text-neutral-300">Price per month (USD)</label>
              <input
                name="pricePerMonth"
                defaultValue={plan.pricePerMonth.toString()}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs outline-none ring-accent-pink/30 focus:ring-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-neutral-300">Billing label</label>
              <input
                name="billingLabel"
                defaultValue={plan.billingLabel}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs outline-none ring-accent-pink/30 focus:ring-2"
              />
            </div>
            <button
              type="submit"
              className="btn-gradient w-full justify-center py-1.5 text-[11px]"
            >
              Save plan
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}

