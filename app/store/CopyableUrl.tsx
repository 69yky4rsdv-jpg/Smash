"use client";

import { useState } from "react";

type Props = {
  url: string;
  label?: string;
};

export function CopyableUrl({ url, label = "Stripe success URL" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("textarea");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-1 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200">{label}</p>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-100 hover:bg-emerald-500/20"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="break-all font-mono text-[11px] text-emerald-50/90">{url}</p>
      <p className="text-[10px] text-neutral-500">Paste this into Stripe → Payment link → After payment redirect.</p>
    </div>
  );
}
