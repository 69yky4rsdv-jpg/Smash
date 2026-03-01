"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type CropAspect = number; // width/height, e.g. 1 = square, 3/4 = portrait

type Props = {
  imageUrl: string;
  aspectRatio: CropAspect;
  maxOutputSize: number; // max width or height of output
  onComplete: (dataUrl: string) => void;
  onCancel: () => void;
};

type Point = { x: number; y: number };

export function ImageCropper({ imageUrl, aspectRatio, maxOutputSize, onComplete, onCancel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState({ x: 0.5, y: 0.5, size: 0.8 }); // center, size as fraction of min(containerW, containerH)
  const dragRef = useRef<{ start: Point; cropStart: { x: number; y: number } } | null>(null);

  const updateContainerSize = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerSize({ w: width, h: height });
  }, []);

  useEffect(() => {
    updateContainerSize();
    const ro = new ResizeObserver(updateContainerSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateContainerSize]);

  const onImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    setImageSize({ w: img.naturalWidth, h: img.naturalHeight });
    setImageLoaded(true);
  }, []);

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

  const getDisplayScale = useCallback(() => {
    if (!containerRef.current || !imgRef.current || !imageLoaded) return { scale: 1, offsetX: 0, offsetY: 0 };
    const cw = containerSize.w;
    const ch = containerSize.h;
    const iw = imageSize.w;
    const ih = imageSize.h;
    const scale = Math.min(cw / iw, ch / ih);
    const scaledW = iw * scale;
    const scaledH = ih * scale;
    const offsetX = (cw - scaledW) / 2;
    const offsetY = (ch - scaledH) / 2;
    return { scale, offsetX, offsetY, scaledW, scaledH };
  }, [containerSize, imageSize, imageLoaded]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragRef.current = {
        start: { x: e.clientX, y: e.clientY },
        cropStart: { x: crop.x, y: crop.y },
      };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [crop.x, crop.y]
  );

  const dragSensitivity = 0.4;

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = (e.clientX - dragRef.current.start.x) / containerSize.w;
      const dy = (e.clientY - dragRef.current.start.y) / containerSize.h;
      dragRef.current.start = { x: e.clientX, y: e.clientY };
      setCrop((prev) => ({
        ...prev,
        x: clamp(prev.x + dx * dragSensitivity, 0, 1),
        y: clamp(prev.y + dy * dragSensitivity, 0, 1),
      }));
    },
    [containerSize.w, containerSize.h]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleApply = useCallback(() => {
    const img = imgRef.current;
    if (!img || !imageLoaded) return;
    const { scale, offsetX, offsetY } = getDisplayScale();
    const boxMin = Math.min(containerSize.w, containerSize.h) * crop.size;
    const boxW = aspectRatio >= 1 ? boxMin : boxMin * aspectRatio;
    const boxH = aspectRatio >= 1 ? boxMin / aspectRatio : boxMin;
    const cx = crop.x * containerSize.w;
    const cy = crop.y * containerSize.h;
    const boxLeft = (cx - boxW / 2) - offsetX;
    const boxTop = (cy - boxH / 2) - offsetY;
    const srcX = Math.max(0, boxLeft / scale);
    const srcY = Math.max(0, boxTop / scale);
    const srcW = Math.min(imageSize.w - srcX, boxW / scale);
    const srcH = Math.min(imageSize.h - srcY, boxH / scale);
    if (srcW <= 0 || srcH <= 0) return;
    const outW = Math.min(maxOutputSize, Math.round(srcW));
    const outH = Math.min(maxOutputSize, Math.round(srcH));
    try {
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      onComplete(dataUrl);
    } catch {
      onComplete(imageUrl);
    }
  }, [imageLoaded, getDisplayScale, containerSize, crop, aspectRatio, imageSize, maxOutputSize, onComplete, imageUrl]);

  const boxMin = containerSize.w && containerSize.h ? Math.min(containerSize.w, containerSize.h) * crop.size : 200;
  const boxW = aspectRatio >= 1 ? boxMin : boxMin * aspectRatio;
  const boxH = aspectRatio >= 1 ? boxMin / aspectRatio : boxMin;
  const left = crop.x * containerSize.w - boxW / 2;
  const top = crop.y * containerSize.h - boxH / 2;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4">
      <div className="text-sm font-medium text-white/90 mb-2">Drag the crop area to position. Then Apply or Cancel.</div>
      <div
        ref={containerRef}
        className="relative w-full max-w-[95vw] flex-1 min-h-[50vh] max-h-[85vh] overflow-hidden rounded-xl bg-neutral-900 flex items-center justify-center"
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Crop"
          className="absolute max-w-full max-h-full w-auto h-auto object-contain"
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          onLoad={onImgLoad}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {imageLoaded && (
          <>
            <div
              className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] cursor-move touch-none"
              style={{
                width: boxW,
                height: boxH,
                left,
                top,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <label className="flex items-center gap-2 text-sm text-white/80">
          <span>Crop size</span>
          <input
            type="range"
            min={0.3}
            max={1}
            step={0.05}
            value={crop.size}
            onChange={(e) => setCrop((p) => ({ ...p, size: Number(e.target.value) }))}
            className="w-24"
          />
        </label>
        <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={!imageLoaded}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50"
        >
          Apply crop
        </button>
        </div>
      </div>
    </div>
  );
}
