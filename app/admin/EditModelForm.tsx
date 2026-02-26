"use client";

import type { Model } from "@/lib/types";
import { useState } from "react";

type Props = {
  models: Model[];
  updateModelAction: (formData: FormData) => Promise<void>;
};

export function EditModelForm({ models, updateModelAction }: Props) {
  const [modelId, setModelId] = useState("");
  const model = models.find((m) => m.id === modelId);

  return (
    <div className="space-y-4">
      <label className="block text-sm text-neutral-200">Select model to edit</label>
      <select
        value={modelId}
        onChange={(e) => setModelId(e.target.value)}
        className="w-full max-w-md rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
      >
        <option value="">— Choose a model —</option>
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.stageName}
          </option>
        ))}
      </select>

      {model && (
        <form action={updateModelAction} className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
          <input type="hidden" name="modelId" value={model.id} />
          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Stage name</label>
            <input
              name="stageName"
              defaultValue={model.stageName}
              required
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Short bio</label>
            <input
              name="bio"
              defaultValue={model.bio ?? ""}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Profile photo URL</label>
            <input
              name="avatarUrl"
              defaultValue={model.avatarUrl ?? ""}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-neutral-200">Gallery image URLs (comma separated)</label>
            <input
              name="gallery"
              defaultValue={model.galleryUrls?.join(", ") ?? ""}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              value="true"
              id="edit-model-active"
              defaultChecked={model.active}
              className="h-3 w-3 rounded border-white/20 bg-black/70"
            />
            <label htmlFor="edit-model-active" className="text-xs text-neutral-200">
              Active (visible on site)
            </label>
          </div>
          <button type="submit" className="btn-gradient w-full justify-center text-sm">
            Save changes
          </button>
        </form>
      )}
    </div>
  );
}
