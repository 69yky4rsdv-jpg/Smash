"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
};

export function CreateModelForm({ action }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await action(formData);
      router.refresh();
      form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 text-sm sm:grid-cols-[2fr,3fr]">
      <div className="space-y-1">
        <label className="text-neutral-200" htmlFor="model-name">
          Stage name
        </label>
        <input
          id="model-name"
          name="name"
          required
          disabled={isPending}
          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2 disabled:opacity-60"
        />
      </div>
      <div className="space-y-1">
        <label className="text-neutral-200" htmlFor="model-bio">
          Short bio
        </label>
        <input
          id="model-bio"
          name="bio"
          disabled={isPending}
          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2 disabled:opacity-60"
        />
      </div>
      <div className="space-y-1">
        <label className="text-neutral-200" htmlFor="model-avatar">
          Profile photo URL
        </label>
        <input
          id="model-avatar"
          name="avatarUrl"
          placeholder="/images/models/anissa.jpg"
          disabled={isPending}
          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2 disabled:opacity-60"
        />
      </div>
      <div className="space-y-1">
        <label className="text-neutral-200" htmlFor="model-gallery">
          Gallery image URLs (one per line or comma-separated; short form cdn.net/... supported)
        </label>
        <textarea
          id="model-gallery"
          name="gallery"
          rows={3}
          placeholder="https://.../img1.jpg&#10;cdn.net/Folder%20pics/.../IMG_0001.JPG"
          disabled={isPending}
          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2 font-mono text-xs disabled:opacity-60"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="btn-gradient col-span-full justify-center text-sm disabled:opacity-60"
      >
        {isPending ? "Adding…" : "Add model"}
      </button>
    </form>
  );
}
