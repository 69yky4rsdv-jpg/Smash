import type { Category } from "@/lib/types";
import { CreateCategoryForm } from "../admin/CreateCategoryForm";
import {
  clearAllVideoCategoriesAction,
  createCategoryAction,
  deleteCategoriesAction,
} from "./actions";

type Props = {
  categories: Category[];
};

export function CategoriesAdmin({ categories }: Props) {
  return (
    <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-4">
      <div>
        <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">Admin — Categories</p>
        <p className="text-[11px] text-neutral-400 mt-1">Add and manage categories used on videos.</p>
      </div>

      <CreateCategoryForm action={createCategoryAction} />

      <div className="flex flex-wrap gap-2 text-[11px] text-neutral-200">
        {categories.map((cat) => (
          <span key={cat.id} className="rounded-lg bg-white/5 px-3 py-1 text-xs text-neutral-100">
            {cat.name}
          </span>
        ))}
      </div>

      <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-3 space-y-2">
        <p className="text-xs font-semibold text-red-300">Bulk remove categories from all videos</p>
        <p className="text-[11px] text-red-200/80">
          This will clear the category list on <strong>every video</strong>. Use this if a TXT import
          assigned the wrong categories and you want to start over.
        </p>
        <form action={clearAllVideoCategoriesAction} className="mt-1">
          <button
            type="submit"
            className="rounded-lg border border-red-500/70 bg-red-500/20 px-4 py-1.5 text-[11px] font-semibold text-red-100 hover:bg-red-500/30"
          >
            Remove all categories from all videos
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-white/15 bg-white/5 p-3 space-y-2">
        <p className="text-xs font-semibold text-neutral-100">Delete categories (up to 30 at a time)</p>
        <p className="text-[11px] text-neutral-400">
          Select categories below and click delete to remove them from the category list and from any
          videos that use them. For safety, only the first 30 selected will be deleted per request.
        </p>
        <form action={deleteCategoriesAction} className="space-y-2 text-xs">
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={cat.id}
                  className="h-3 w-3 rounded border-white/30 bg-black"
                />
                <span className="truncate">{cat.name}</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="rounded-lg border border-red-400/70 bg-red-500/30 px-4 py-1.5 text-[11px] font-semibold text-red-50 hover:bg-red-500/50"
          >
            Delete selected categories (max 30)
          </button>
        </form>
      </div>
    </section>
  );
}
