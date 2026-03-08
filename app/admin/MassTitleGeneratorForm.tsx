"use client";

import type { Video } from "@/lib/types";
import type { MassTitleDebugItem } from "@/lib/mass-title-generator";
import { useActionState, useState } from "react";

type State =
  | { updated?: number; skipped?: number; error?: string; errors?: string[]; debug?: MassTitleDebugItem[] }
  | null;

export function MassTitleGeneratorForm({
  videos,
  action
}: {
  videos: Video[];
  action: (prev: State, formData: FormData) => Promise<State>;
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleAll(checked: boolean) {
    if (checked) setSelected(new Set(videos.map((v) => v.id)));
    else setSelected(new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  }

  return (
    <form action={formAction} className="space-y-4 text-sm">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-neutral-200 font-medium">Videos to generate titles for</label>
          <label className="flex items-center gap-2 text-xs text-neutral-400">
            <input
              type="checkbox"
              checked={selected.size === videos.length && videos.length > 0}
              onChange={(e) => toggleAll(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-white/20"
            />
            Select all
          </label>
        </div>
        <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-2 space-y-1">
          {videos.length === 0 ? (
            <p className="text-neutral-500 text-xs py-2">No videos. Add videos first.</p>
          ) : (
            videos.map((video) => (
              <label
                key={video.id}
                className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="videoIds"
                  value={video.id}
                  checked={selected.has(video.id)}
                  onChange={(e) => toggleOne(video.id, e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-white/20"
                />
                <span className="line-clamp-1 text-neutral-200">{video.title}</span>
              </label>
            ))
          )}
        </div>
        <p className="text-[11px] text-neutral-500">
          Match is by video name/code and performer names from the TXT. If no search results are found, we use a generated title (e.g. code + performers). No API key required.
        </p>
      </div>
      <div className="space-y-1">
        <label className="text-neutral-200 font-medium" htmlFor="massTitleTxt">
          TXT file content (Name | Type | Performer | Artists | Categories)
        </label>
        <textarea
          id="massTitleTxt"
          name="txtContent"
          rows={10}
          placeholder={`Paste the same table format as “Apply TXT metadata”:\nHDVS2273 | HD Video | Daphne Rosen | Daphne Rosen, Dirty Harry | ...\nSo we can match video name and performer names, then search for titles.`}
          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm font-mono outline-none ring-accent-pink/30 focus:ring-2"
        />
      </div>
      {state?.error && (
        <p className="rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-300">{state.error}</p>
      )}
      {state?.errors && state.errors.length > 0 && (
        <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200 space-y-1">
          <p className="font-medium">Warnings / errors:</p>
          <ul className="list-disc list-inside">
            {state.errors.slice(0, 10).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
            {state.errors.length > 10 && (
              <li>… and {state.errors.length - 10} more</li>
            )}
          </ul>
        </div>
      )}
      {state?.updated != null && !state.error && (
        <p className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs text-emerald-300">
          Updated {state.updated} title(s). Skipped: {state.skipped ?? 0}.
        </p>
      )}
      {state?.debug && state.debug.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-4 text-xs">
          <p className="font-semibold text-neutral-200">Last run — what we got:</p>
          {state.debug.map((d, i) => (
            <div key={d.videoId + String(i)} className="space-y-1.5 border-t border-white/5 pt-3 first:border-t-0 first:pt-0">
              <p className="text-neutral-300">
                <span className="font-medium">{d.videoTitle}</span>
                {d.updated && <span className="ml-2 text-emerald-400">→ updated</span>}
              </p>
              <p className="text-neutral-500">
                Query: &quot;{d.query}&quot; · Source: <span className="text-neutral-400">{d.source}</span> · Found {d.candidatesCount} result(s)
              </p>
              {d.candidatesCount > 0 ? (
                <>
                  <p className="text-neutral-500">First 5 titles from search:</p>
                  <ol className="list-decimal list-inside text-neutral-400 space-y-0.5 ml-1">
                    {d.candidates.slice(0, 5).map((c, j) => (
                      <li key={j} className="truncate" title={c}>{c}</li>
                    ))}
                  </ol>
                  <p className="text-neutral-500">
                    Chosen: <span className="text-neutral-300">{d.chosenTitle}</span>
                  </p>
                </>
              ) : (
                <p className="text-amber-400/90">No titles extracted. Google/DDG may block server requests — try adding SERPAPI_KEY in .env for reliable results.</p>
              )}
            </div>
          ))}
        </div>
      )}
      <button
        type="submit"
        disabled={isPending || selected.size === 0}
        className="btn-gradient justify-center text-sm px-4 py-2 disabled:opacity-50"
      >
        {isPending ? "Generating titles…" : "Generate titles from search"}
      </button>
    </form>
  );
}
