type Badge = {
  icon: string;
  label: string;
  detail: string;
};

const BADGES: Badge[] = [
  { icon: "🔒", label: "Secure checkout", detail: "Stripe encrypted payment" },
  { icon: "⚡", label: "Instant access", detail: "Watch right after purchase" },
  { icon: "✓", label: "One-time buy", detail: "No subscription required" },
  { icon: "▶", label: "HD streaming", detail: "Full scene, anytime" },
  { icon: "🛡", label: "Discreet billing", detail: "Private statement descriptor" },
];

export function StoreTrustBadges({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-neutral-400">
        {BADGES.map((badge) => (
          <span key={badge.label} className="inline-flex items-center gap-1.5">
            <span aria-hidden className="text-neutral-500">
              {badge.icon}
            </span>
            {badge.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {BADGES.map((badge) => (
        <div
          key={badge.label}
          className="flex items-start gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
        >
          <span aria-hidden className="mt-0.5 text-sm text-pink-300/80">
            {badge.icon}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-neutral-200">{badge.label}</p>
            <p className="text-[10px] leading-snug text-neutral-500">{badge.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
