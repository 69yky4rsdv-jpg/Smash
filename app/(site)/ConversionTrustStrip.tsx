import Link from "next/link";

type Props = {
  className?: string;
  compact?: boolean;
};

const ITEMS = [
  { label: "Secure Stripe checkout" },
  { label: "Instant access after purchase" },
  { label: "One-time buys — no subscription" },
  { label: "18+ verified performers" },
] as const;

export function ConversionTrustStrip({ className = "", compact = false }: Props) {
  if (compact) {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-neutral-400 ${className}`}
      >
        {ITEMS.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            {item.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-300">
        {ITEMS.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2">
            <span className="text-emerald-400" aria-hidden>
              ✓
            </span>
            {item.label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-neutral-500">
        Questions?{" "}
        <Link href="/support" className="text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline">
          Contact support
        </Link>
        {" · "}
        <Link href="/privacy" className="text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline">
          Privacy
        </Link>
        {" · "}
        <Link href="/2257" className="text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline">
          2257
        </Link>
      </p>
    </div>
  );
}
