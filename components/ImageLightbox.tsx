"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react";

const MIN_SCALE = 1;
const MAX_SCALE = 6;

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const RESET: Transform = { scale: 1, x: 0, y: 0 };

/**
 * Full-screen photo viewer. Mouse wheel zooms in and out around the cursor,
 * drag moves the photo when zoomed, double-click toggles zoom, and on a phone
 * you pinch and drag. Arrow keys switch photos, Escape closes.
 */
export default function ImageLightbox({
  images,
  startIndex,
  alt,
  onClose,
}: {
  images: string[];
  startIndex: number;
  alt: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [t, setT] = useState<Transform>(RESET);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const tRef = useRef(t);
  tRef.current = t;

  const clampPosition = (scale: number, x: number, y: number): Transform => {
    if (scale <= MIN_SCALE) return RESET;
    const el = stageRef.current;
    if (!el) return { scale, x, y };
    // Keep the zoomed photo from being dragged completely out of view.
    const maxX = (el.clientWidth * (scale - 1)) / 2;
    const maxY = (el.clientHeight * (scale - 1)) / 2;
    return {
      scale,
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  /** Zoom to `nextScale`, keeping the point under (cx, cy) (relative to the stage centre) fixed. */
  const zoomAt = useCallback((nextScale: number, cx: number, cy: number) => {
    const cur = tRef.current;
    const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));
    const ratio = scale / cur.scale;
    setT(clampPosition(scale, cx - (cx - cur.x) * ratio, cy - (cy - cur.y) * ratio));
  }, []);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + images.length) % images.length);
      setT(RESET);
    },
    [images.length]
  );

  // Mouse wheel must be a non-passive listener so the page behind does not scroll.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      zoomAt(tRef.current.scale * Math.exp(-e.deltaY * 0.0018), cx, cy);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && images.length > 1) go(1);
      else if (e.key === "ArrowLeft" && images.length > 1) go(-1);
      else if (e.key === "+" || e.key === "=") zoomAt(tRef.current.scale * 1.4, 0, 0);
      else if (e.key === "-") zoomAt(tRef.current.scale / 1.4, 0, 0);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onClose, images.length, zoomAt]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: tRef.current.scale };
      dragStart.current = null;
    } else {
      dragStart.current = { x: e.clientX, y: e.clientY, tx: tRef.current.x, ty: tRef.current.y };
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((pinchStart.current.scale * dist) / pinchStart.current.dist, 0, 0);
    } else if (dragStart.current && tRef.current.scale > MIN_SCALE) {
      const d = dragStart.current;
      setT(clampPosition(tRef.current.scale, d.tx + (e.clientX - d.x), d.ty + (e.clientY - d.y)));
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    pinchStart.current = null;
    dragStart.current = null;
  };

  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tRef.current.scale > 1) {
      setT(RESET);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    zoomAt(2.5, e.clientX - rect.left - rect.width / 2, e.clientY - rect.top - rect.height / 2);
  };

  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt}, photo ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-white">
        <span className="truncate">
          {alt} · {index + 1}/{images.length}
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => zoomAt(tRef.current.scale / 1.5, 0, 0)} aria-label="Zoom out" className={btn}>
            <Minus className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => zoomAt(tRef.current.scale * 1.5, 0, 0)} aria-label="Zoom in" className={btn}>
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setT(RESET)} aria-label="Reset zoom" className={btn}>
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={onClose} aria-label="Close" className={btn}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={onDoubleClick}
          className={`flex h-full w-full touch-none select-none items-center justify-center overflow-hidden ${
            t.scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
          }`}
        >
          {/* Plain img: needs raw pixel size for zooming, and the URL may be any https host. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt={alt}
            draggable={false}
            className="max-h-full max-w-full object-contain will-change-transform"
            style={{
              transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
              transition: pointers.current.size ? "none" : "transform 80ms ease-out",
            }}
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className={`${btn} absolute left-3 top-1/2 -translate-y-1/2`}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className={`${btn} absolute right-3 top-1/2 -translate-y-1/2`}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <p className="px-4 py-2 text-center text-xs text-gray-300">
        Scroll to zoom · drag to move · double-click to zoom in or out
      </p>
    </div>
  );
}
