"use client";

import { useState, useCallback, useEffect } from "react";

type Props = {
  urls: string[];
  altPrefix: string;
  gridClassName?: string;
  itemClassName?: string;
};

export function GalleryWithLightbox({ urls, altPrefix, gridClassName, itemClassName }: Props) {
  const [index, setIndex] = useState<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (urls.length === 0) return;
      setIndex((i) => {
        if (i === null) return null;
        const next = i + delta;
        if (next < 0) return urls.length - 1;
        if (next >= urls.length) return 0;
        return next;
      });
    },
    [urls.length]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  if (urls.length === 0) return null;

  return (
    <>
      <div className={gridClassName ?? "grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}>
        {urls.map((url, i) => (
          <button
            key={`${url}-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            className={`overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-white/10 transition hover:ring-accent-pink/50 focus:outline-none focus:ring-2 focus:ring-accent-pink/50 ${itemClassName ?? "aspect-square"}`}
          >
            <img
              src={url}
              alt={`${altPrefix} ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {index !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed image"
        >
          <button
            type="button"
            onClick={() => setIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-4"
            aria-label="Previous"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img
            src={urls[index]}
            alt={`${altPrefix} ${index + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-4"
            aria-label="Next"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {index + 1} / {urls.length}
          </span>
        </div>
      )}
    </>
  );
}
