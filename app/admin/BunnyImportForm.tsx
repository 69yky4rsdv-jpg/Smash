"use client";

import { useActionState } from "react";

type State = { created?: number; total?: number; error?: string } | null;

export function BunnyImportForm({
  action
}: {
  action: (prev: State, formData: FormData) => Promise<State>;
}) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-neutral-200" htmlFor="bunnyAccessKey">
            Stream API Key
          </label>
          <input
            id="bunnyAccessKey"
            name="bunnyAccessKey"
            type="password"
            placeholder="Your Bunny Stream API key"
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-neutral-200" htmlFor="bunnyLibraryId">
            Library ID
          </label>
          <input
            id="bunnyLibraryId"
            name="bunnyLibraryId"
            placeholder="e.g. 12345"
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-neutral-200" htmlFor="bunnyVideoPullZone">
            Video pull zone hostname
          </label>
          <input
            id="bunnyVideoPullZone"
            name="bunnyVideoPullZone"
            placeholder="e.g. vz-c0889f21-9e9"
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
          />
          <p className="text-[11px] text-neutral-500">No .b-cdn.net — used for HLS URLs</p>
        </div>
        <div className="space-y-1">
          <label className="text-neutral-200" htmlFor="bunnyThumbnailPullZone">
            Thumbnail pull zone (optional)
          </label>
          <input
            id="bunnyThumbnailPullZone"
            name="bunnyThumbnailPullZone"
            placeholder="e.g. Pull-Video-Load"
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
          />
        </div>
      </div>
      {state?.error && (
        <p className="rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-300">{state.error}</p>
      )}
      {state?.created != null && !state.error && (
        <p className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs text-emerald-300">
          Created {state.created} video page(s) from Bunny (skipped existing). Total in library: {state.total}.
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="btn-gradient justify-center text-sm px-4 py-2 disabled:opacity-50"
      >
        {isPending ? "Fetching…" : "Fetch from Bunny & create video pages"}
      </button>
    </form>
  );
}
