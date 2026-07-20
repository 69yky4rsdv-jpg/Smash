"use client";

import Link from "next/link";
import { useStorePreviewAnalytics } from "./StorePreviewTracker";

type BuyActionProps = {
  href: string;
  external?: boolean;
  label: string;
  className?: string;
};

function BuyAction({
  href,
  external,
  label,
  className,
  onClick,
}: BuyActionProps & { onClick?: () => void }) {
  const classes = className ?? "btn-gradient mt-4 w-full justify-center text-sm py-2.5";
  if (external) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} onClick={onClick}>
      {label}
    </Link>
  );
}

type Props = {
  price: number;
  hasFullAccess: boolean;
  watchHref: string;
  buyHref: string;
  buyExternal: boolean;
  videoId?: string;
  visitId?: string;
  durationLabel?: string;
  featuring?: string;
  exclusive: boolean;
  publishedAt: string;
};

export function StorePurchasePanel({
  price,
  hasFullAccess,
  watchHref,
  buyHref,
  buyExternal,
  videoId,
  visitId,
  durationLabel,
  featuring,
  exclusive,
  publishedAt,
}: Props) {
  const priceStr = `$${price.toFixed(2)}`;
  const { trackBuyClick } = useStorePreviewAnalytics(videoId ?? "", visitId);

  function handleBuyClick() {
    if (videoId) trackBuyClick();
  }

  if (hasFullAccess) {
    return (
      <aside className="space-y-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300">Your purchase</p>
        <p className="text-xs text-emerald-200">You own this video — watch anytime.</p>
        <BuyAction href={watchHref} label="Watch full video" className="btn-gradient w-full justify-center text-sm py-2.5" />
      </aside>
    );
  }

  return (
    <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">Purchase</p>
      <div>
        <p className="text-3xl font-bold text-white">{priceStr}</p>
        <p className="text-xs text-neutral-400">one-time · no subscription</p>
      </div>

      <ul className="space-y-2 text-xs text-neutral-300">
        {durationLabel ? (
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>
              Full <span className="text-white">{durationLabel}</span> scene
            </span>
          </li>
        ) : null}
        {exclusive ? (
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Exclusive — only on this site</span>
          </li>
        ) : null}
        <li className="flex items-start gap-2">
          <span className="text-emerald-400">✓</span>
          <span>Instant access after payment</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-400">✓</span>
          <span>Log in after checkout to watch</span>
        </li>
      </ul>

      <BuyAction
        href={buyHref}
        external={buyExternal}
        label={`Buy full video — ${priceStr}`}
        onClick={handleBuyClick}
      />
      <p className="text-center text-[10px] text-neutral-500">
        🔒 Secure checkout via Stripe · discreet billing · instant access
      </p>

      <div className="space-y-1 border-t border-white/10 pt-3 text-xs text-neutral-400">
        {featuring ? <p>Featuring: {featuring}</p> : null}
        <p>Released: {new Date(publishedAt).toLocaleDateString()}</p>
      </div>
    </aside>
  );
}
