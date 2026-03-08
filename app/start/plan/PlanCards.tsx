"use client";

import Link from "next/link";
import type { SubscriptionPlan } from "@/lib/types";

type Props = {
  plans: SubscriptionPlan[];
  /** Sticker text for the 7-day trial card (e.g. "Free 7 days"). */
  freeTrialStickerText?: string;
};

export function PlanCards({ plans, freeTrialStickerText = "Free 7 days" }: Props) {
  return (
    <div className="mt-8 space-y-4">
      {plans.map((plan, index) => {
        const content = (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {plan.id === "weekly" && freeTrialStickerText && (
                <span className="inline-block rounded bg-pink-500/80 px-2 py-0.5 text-xs font-bold uppercase text-white">
                  {freeTrialStickerText}
                </span>
              )}
              <h3 className="mt-2 text-sm font-bold uppercase text-white">
                {plan.name}
              </h3>
              <p className="mt-1 text-xs text-neutral-400">
                {plan.billingLabel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">
                {plan.id === "weekly" ? "$0.00" : `$${plan.pricePerMonth.toFixed(2)}`}
                <span className="ml-1 text-xs font-normal text-neutral-400">
                  / {plan.id === "weekly" ? "1st week" : "first month"}
                </span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded bg-black/50 text-pink-400">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </span>
            </div>
          </div>
        );
        const cardClass = `block min-h-[48px] cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ease-out active:scale-[0.99] ${
          index === 1
            ? "border-pink-500/50 bg-pink-500/20 hover:scale-[1.02] hover:border-pink-400 hover:bg-pink-500/30 hover:shadow-lg hover:shadow-pink-500/25"
            : "border-pink-500/40 bg-pink-500/10 hover:scale-[1.02] hover:border-pink-400 hover:bg-pink-500/20 hover:shadow-lg hover:shadow-pink-500/20"
        }`;
        return plan.checkoutUrl ? (
          <Link
            key={plan.id}
            href={plan.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cardClass}
          >
            {content}
          </Link>
        ) : (
          <div key={plan.id} className={cardClass}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
