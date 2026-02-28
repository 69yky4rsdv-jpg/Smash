"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
};

export function CreateCategoryForm({ action }: Props) {
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
    <form onSubmit={handleSubmit} className="flex gap-2 text-sm">
      <input
        name="name"
        placeholder="e.g. Cosplay, Threesome"
        required
        disabled={isPending}
        className="flex-1 rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none ring-accent-pink/30 focus:ring-2 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={isPending}
        className="btn-gradient px-4 py-2 text-xs disabled:opacity-60"
      >
        {isPending ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
