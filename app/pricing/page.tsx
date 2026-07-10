import { subscriptionPlans } from "@/lib/data";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { updateSubscriptionPlan } from "@/lib/admin";
import { PricingAdminControls } from "./PricingAdminControls";

async function updatePlanAction(formData: FormData) {
  "use server";
  const planId = String(formData.get("planId") ?? "").trim();
  const priceRaw = String(formData.get("pricePerMonth") ?? "").trim();
  const billingLabel = String(formData.get("billingLabel") ?? "").trim();

  if (!planId || !priceRaw) return;
  const price = parseFloat(priceRaw);
  if (!Number.isFinite(price) || price <= 0) return;

  updateSubscriptionPlan(planId, {
    pricePerMonth: price,
    billingLabel: billingLabel || undefined
  });

  revalidatePath("/pricing");
  revalidatePath("/");
}

export default async function PricingPage() {
  const { isAdmin } = await getSession();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
          <header className="text-center space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">Choose your membership</h1>
            <p className="text-sm text-neutral-300">
              One subscription unlocks the entire SmashPOV library. No ads, no upsells.
            </p>
          </header>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {subscriptionPlans.map((plan) => (
              <article
                key={plan.id}
                className={`card-surface flex flex-col p-5 ${
                  plan.highlight ? "ring-2 ring-accent-pink/70" : ""
                }`}
              >
                <h2 className="text-sm font-semibold text-neutral-100">{plan.name}</h2>
                <p className="mt-3 text-3xl font-bold">
                  ${plan.pricePerMonth.toFixed(2)}
                  <span className="text-xs text-neutral-400"> / month</span>
                </p>
                <p className="mt-1 text-[11px] text-neutral-400">{plan.billingLabel}</p>
                <ul className="mt-4 space-y-1 text-[11px] text-neutral-300">
                  <li>• Unlimited streaming</li>
                  <li>• Mobile and TV-optimized player</li>
                  <li>• Access to all categories and models</li>
                  {plan.highlight && <li>• Best value for long-term fans</li>}
                </ul>
                <div className="mt-6">
                  <Link
                    href={plan.checkoutUrl ?? "/auth/register"}
                    className="btn-gradient w-full justify-center"
                    {...(plan.checkoutUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    Start with this plan
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <p className="text-center text-[11px] text-neutral-500">
            Billing handled securely by your chosen payment provider. Cancel anytime from your
            account dashboard.
          </p>

          <PricingAdminControls
            plans={subscriptionPlans}
            updatePlanAction={updatePlanAction}
            isAdmin={isAdmin}
          />
        </div>
  );
}

