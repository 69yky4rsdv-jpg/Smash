"use client";

import { useState } from "react";

type Props = {
  action: () => Promise<{ updated: number }>;
};

export function AutoGenderButton({ action }: Props) {
  const [result, setResult] = useState<{ updated: number } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    setResult(null);
    try {
      const r = await action();
      setResult(r);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-white/10 disabled:opacity-50"
      >
        {pending ? "Running…" : "Auto-categorize male/female from names"}
      </button>
      {result != null && (
        <p className="text-xs text-emerald-400">
          Set gender for {result.updated} model{result.updated === 1 ? "" : "s"} (only models that had no gender).
        </p>
      )}
    </div>
  );
}
