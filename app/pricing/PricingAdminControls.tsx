"use client";

import type { SubscriptionPlan } from "@/lib/types";

type Props = {
  plans: SubscriptionPlan[];
  updatePlanAction: (formData: FormData) => Promise<void>;
  isAdmin?: boolean;
};

export function PricingAdminControls({ plans, updatePlanAction, isAdmin = false }: Props) {
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
            <p className="font-semibold text-neutral-100">{plan.name}</p>
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400">Price / month (USD)</label>
              <input
                name="pricePerMonth"
                type="number"
                step="0.01"
                min="0"
                defaultValue={plan.pricePerMonth}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-xs outline-none focus:ring-2 ring-accent-pink/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400">Billing label</label>
              <input
                name="billingLabel"
                defaultValue={plan.billingLabel ?? ""}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-xs outline-none focus:ring-2 ring-accent-pink/30"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg border border-accent-pink/40 bg-accent-pink/10 px-3 py-1.5 text-[11px] font-semibold text-accent-pink hover:bg-accent-pink/20"
            >
              Save plan
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
