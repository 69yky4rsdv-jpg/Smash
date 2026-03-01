"use client";

import type { Category } from "@/lib/types";
import type { Video } from "@/lib/types";
import { CategoriesClient } from "./CategoriesClient";

type Props = {
  categories: Category[];
  videos: Video[];
  initialLoggedIn?: boolean;
  skipGate?: boolean;
};

/** Gate disabled — always shows categories. */
export function CategoriesGate({ categories, videos }: Props) {
  return <CategoriesClient categories={categories} videos={videos} />;
}
