"use client";

import { useActionState } from "react";

type State =
  | { videosUpdated?: number; modelsCreated?: number; categoriesCreated?: number; error?: string }
  | null;

export function TxtMetadataForm({
  action
}: {
  action: (prev: State, formData: FormData) => Promise<State>;
}) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4 text-sm">
      <div className="space-y-1">
        <label className="text-neutral-200" htmlFor="txtMetadata">
          TXT metadata (one line per video)
        </label>
        <textarea
          id="txtMetadata"
          name="txtMetadata"
          rows={12}
          placeholder={`Table format (Name | Type | Performer | Artists | Categories):\nHDVS2273 | HD Video | Daphne Rosen | Daphne Rosen, Dirty Harry | Handjob, Anal, ...\n\nOr: Video Code | Performer1, Performer2 | Category1, Category2`}
          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm font-mono outline-none ring-accent-pink/30 focus:ring-2"
        />
        <p className="text-[11px] text-neutral-500">
          Table: Name (code) | Type | Performer | Artists | Categories. Match by code or title. Creates performers and categories if missing.
        </p>
      </div>
      {state?.error && (
        <p className="rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-300">{state.error}</p>
      )}
      {state?.videosUpdated != null && !state.error && (
        <div className="space-y-1">
          <p className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs text-emerald-300">
            Updated {state.videosUpdated} video(s). New performers: {state.modelsCreated ?? 0}, new categories: {state.categoriesCreated ?? 0}.
          </p>
          {state.videosUpdated === 0 && (
            <p className="text-[11px] text-amber-400/90">
              No videos matched. Videos are matched by <strong>id or title</strong> containing the TXT Name (e.g. HDVS2273), or by the same <strong>last 4 digits</strong>. Ensure your video id/title includes the scene code or run Bunny import so titles match.
            </p>
          )}
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="btn-gradient justify-center text-sm px-4 py-2 disabled:opacity-50"
      >
        {isPending ? "Applying…" : "Apply TXT to videos"}
      </button>
    </form>
  );
}
