"use client";

import { useActionState } from "react";

type BrowseState = { path?: string; folders?: string[]; fileCount?: number; error?: string } | null;
type ImportState = {
  photosetsProcessed?: number;
  videosUpdated?: number;
  thumbnailsSet?: number;
  error?: string;
  errors?: string[];
} | null;

type Props = {
  action: (prev: ImportState, formData: FormData) => Promise<ImportState>;
  browseAction: (prev: BrowseState, formData: FormData) => Promise<BrowseState>;
};

export function ImportPhotoSetsForm({ action, browseAction }: Props) {
  const [state, formAction] = useActionState(action, null);
  const [browseState, browseFormAction] = useActionState(browseAction, null);

  return (
    <div className="space-y-6">
      {/* Step 1: Discover path */}
      <div className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-3">
        <h4 className="text-xs font-semibold text-neutral-300">Step 1: Find the correct path</h4>
        <p className="text-[11px] text-neutral-400">
          List folders at a path to see your storage structure. Try <strong>empty</strong> for root, then e.g. <code className="rounded bg-white/10 px-1">Folder pics</code> or <code className="rounded bg-white/10 px-1">PhotoSets</code> until you see your photoset names (e.g. HCPS0606, HDVS2273). Use that path in Step 2.
        </p>
        <form action={browseFormAction} className="flex flex-wrap items-end gap-3">
          <div className="space-y-1 min-w-[140px]">
            <label className="text-[11px] text-neutral-400 block">Storage zone</label>
            <input
              name="browseStorageZone"
              defaultValue="featurevideo-storage"
              className="w-full rounded border border-white/10 bg-black/60 px-2 py-1.5 text-xs"
            />
          </div>
          <div className="space-y-1 min-w-[140px]">
            <label className="text-[11px] text-neutral-400 block">Storage zone password</label>
            <input
              name="browseStoragePassword"
              type="password"
              required
              placeholder="From zone’s FTP & API Access"
              className="w-full rounded border border-white/10 bg-black/60 px-2 py-1.5 text-xs"
            />
            <p className="text-[10px] text-amber-400/90 mt-0.5">Not your account API key — use this zone’s password.</p>
          </div>
          <div className="space-y-1 min-w-[120px]">
            <label className="text-[11px] text-neutral-400 block">Path to list</label>
            <input
              name="browsePath"
              placeholder="(empty = root)"
              className="w-full rounded border border-white/10 bg-black/60 px-2 py-1.5 text-xs"
            />
          </div>
          <div className="space-y-1 min-w-[120px]">
            <label className="text-[11px] text-neutral-400 block">API host</label>
            <input
              name="browseStorageHost"
              defaultValue="storage.bunnycdn.com"
              className="w-full rounded border border-white/10 bg-black/60 px-2 py-1.5 text-xs"
            />
          </div>
          <button type="submit" className="btn-gradient text-xs px-3 py-1.5">
            List folders
          </button>
        </form>
        {browseState?.error && (
          <p className="text-xs text-red-400">{browseState.error}</p>
        )}
        {browseState?.folders != null && !browseState?.error && (
          <div className="text-xs">
            <p className="text-neutral-400">
              At path <code className="rounded bg-white/10 px-1">{browseState.path}</code>:{" "}
              <span className="text-neutral-200">{browseState.folders.length} folder(s)</span>
              {browseState.fileCount != null && browseState.fileCount > 0 && (
                <span className="text-neutral-500">, {browseState.fileCount} file(s)</span>
              )}
            </p>
            <p className="text-neutral-300 mt-1 font-mono text-[11px] break-all">
              {browseState.folders.length > 0 ? browseState.folders.slice(0, 50).join(", ") : "(none)"}
              {browseState.folders.length > 50 && ` … +${browseState.folders.length - 50} more`}
            </p>
            {browseState.folders.length > 0 && (
              <p className="text-green-400/90 mt-1">
                If these are your photoset names, copy the path above into &quot;Path to PhotoSets folder&quot; below. If you see a parent folder (e.g. PhotoSets), enter that path and list again.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Import */}
      <div>
        <h4 className="text-xs font-semibold text-neutral-300 mb-2">Step 2: Import PhotoSets</h4>
        <p className="text-[11px] text-neutral-400 mb-3">
          Match by <strong>last 4 digits</strong> (e.g. folder HCPS0606 and video with 0606 in id/title). When <strong>TXT metadata</strong> is pasted: the TXT must have both a <em>video</em> row and a <em>photoset</em> row for that digit (e.g. HDVS0606 | HD Video | … and HCPS0606 | Hardcore Photoset | …), and the <strong>model/performer names must match</strong> between those rows — then the photoset is added to that video and models/categories are set from the TXT. Without TXT, only last 4 digits are used. Thumbnail is set to the first photo when missing.
        </p>
        <form action={formAction} className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="text-neutral-200" htmlFor="photosetsTxtMetadata">
              TXT metadata (optional, recommended)
            </label>
            <textarea
              id="photosetsTxtMetadata"
              name="photosetsTxtMetadata"
              rows={6}
              placeholder="Paste the same TXT table (Name | Type | Performer | Artists | Categories) used for metadata import. Used to match photosets to videos by Name/code and to set video models/categories."
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm font-mono text-xs outline-none ring-accent-pink/30 focus:ring-2"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-neutral-200" htmlFor="photosetsStorageZone">
                Storage zone name
              </label>
              <input
                id="photosetsStorageZone"
                name="photosetsStorageZone"
                defaultValue="featurevideo-storage"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-200" htmlFor="photosetsStoragePassword">
                Storage zone password <span className="text-red-400">*</span>
              </label>
              <input
                id="photosetsStoragePassword"
                name="photosetsStoragePassword"
                type="password"
                required
                placeholder="From this zone’s FTP & API Access tab"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
              />
              <p className="text-[11px] text-amber-400/90">Use this storage zone’s password, not your bunny.net account API key. 401 = wrong key.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-neutral-200" htmlFor="photosetsStorageHost">
                Storage API host
              </label>
              <input
                id="photosetsStorageHost"
                name="photosetsStorageHost"
                defaultValue="storage.bunnycdn.com"
                placeholder="storage.bunnycdn.com"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-200" htmlFor="photosetsPath">
                Path to PhotoSets folder (from Step 1)
              </label>
              <input
                id="photosetsPath"
                name="photosetsPath"
                placeholder="e.g. PhotoSets or Folder pics/PhotoSets (leave empty for root)"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-neutral-200" htmlFor="photosetsPullZoneHost">
                Pull zone host (CDN URL) <span className="text-red-400">*</span>
              </label>
              <input
                id="photosetsPullZoneHost"
                name="photosetsPullZoneHost"
                required
                placeholder="Pull-Video-Load.b-cdn.net"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-200" htmlFor="photosetsUrlPrefix">
                URL path prefix (optional)
              </label>
              <input
                id="photosetsUrlPrefix"
                name="photosetsUrlPrefix"
                placeholder="e.g. Folder pics"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
              />
            </div>
          </div>
          <button type="submit" className="btn-gradient justify-center text-sm px-4 py-2">
            Import PhotoSets to video galleries
          </button>
          {state?.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}
          {state?.errors && state.errors.length > 0 && (
            <ul className="text-xs text-amber-400 list-disc list-inside">
              {state.errors.slice(0, 10).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {state.errors.length > 10 && (
                <li>… and {state.errors.length - 10} more</li>
              )}
            </ul>
          )}
          {state?.videosUpdated != null && !state?.error && (
            <p className="text-sm text-green-400">
              Processed {state.photosetsProcessed} photoset(s). Updated {state.videosUpdated} video(s), set {state.thumbnailsSet} thumbnail(s).
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
