"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ZoomImageProps = ComponentPropsWithoutRef<"img">;

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ZoomImage({ alt, src, className, style, ...props }: ZoomImageProps) {
  const [zoom, setZoom] = useState(1);
  const [baseFitSize, setBaseFitSize] = useState<{ width: number; height: number } | null>(null);
  const modalImageRef = useRef<HTMLImageElement | null>(null);

  const normalizedClassName = className?.trim() ?? "";
  const classTokens = normalizedClassName.length > 0 ? normalizedClassName.split(/\s+/) : [];
  const isDefaultMarkdownImageClass =
    classTokens.length === 3
    && classTokens.includes("w-full")
    && classTokens.includes("max-h-[24rem]")
    && classTokens.includes("object-contain");

  const effectiveClassName = isDefaultMarkdownImageClass ? "" : normalizedClassName;
  const hasCustomSizing = effectiveClassName.length > 0;

  const imageAlt = alt?.trim() || "Image";
  const canZoomOut = zoom > MIN_ZOOM;
  const canZoomIn = zoom < MAX_ZOOM;

  const zoomPercent = useMemo(() => Math.round(zoom * 100), [zoom]);
  const renderedWidth = baseFitSize ? baseFitSize.width * zoom : undefined;
  const renderedHeight = baseFitSize ? baseFitSize.height * zoom : undefined;

  const captureBaseFitSize = () => {
    const image = modalImageRef.current;
    if (!image) {
      return;
    }

    const rect = image.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    setBaseFitSize({ width: rect.width, height: rect.height });
  };

  const previewClassName = hasCustomSizing
    ? effectiveClassName
    : "aspect-[4/3] w-full object-cover";
  const usesFullWidthLayout = Boolean(previewClassName.match(/(^|\s)(w-full|aspect-|h-full)(\s|$)/));
  const triggerClassName = usesFullWidthLayout
    ? "group my-8 block w-full overflow-hidden rounded-2xl border border-white/15 bg-black/20 text-left shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)] backdrop-blur-sm transition hover:border-white/30 hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.85)]"
    : "group my-8 mx-auto inline-flex w-fit max-w-full overflow-hidden rounded-2xl border border-white/15 bg-black/20 p-2 text-left shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)] backdrop-blur-sm transition hover:border-white/30 hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.85)]";

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (isOpen) {
          setZoom(1);
          setBaseFitSize(null);
          requestAnimationFrame(() => {
            captureBaseFitSize();
          });
          return;
        }

        setZoom(1);
        setBaseFitSize(null);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className={triggerClassName}
          aria-label={`Open ${imageAlt} in zoom view`}
        >
          <img
            src={src}
            alt={imageAlt}
            className={cn(
              "block transition duration-300 group-hover:scale-[1.01]",
              previewClassName,
            )}
            style={{
              ...style,
            }}
            loading={props.loading ?? "lazy"}
            decoding={props.decoding ?? "async"}
            {...props}
          />
          {/* <span className="mt-3 flex items-center justify-between px-1 text-xs uppercase tracking-[0.2em] text-white/60">
            <span>{imageAlt}</span>
            <span>Click to expand</span>
          </span> */}
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[96dvh] max-w-[96vw] overflow-hidden border-white/15 bg-black/95 p-0 text-white shadow-2xl sm:max-w-[92vw]">
        <DialogTitle className="sr-only">{imageAlt}</DialogTitle>

        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-sm">
          <p className="truncate text-white/85">{imageAlt}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canZoomOut}
              onClick={() => setZoom((current) => clamp(current - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))}
              className="rounded-md border border-white/20 px-3 py-1.5 text-xs uppercase tracking-wide text-white/85 transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Zoom out"
            >
              -
            </button>
            <span className="min-w-16 text-center text-xs text-white/70">{zoomPercent}%</span>
            <button
              type="button"
              disabled={!canZoomIn}
              onClick={() => setZoom((current) => clamp(current + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))}
              className="rounded-md border border-white/20 px-3 py-1.5 text-xs uppercase tracking-wide text-white/85 transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="rounded-md border border-white/20 px-3 py-1.5 text-xs uppercase tracking-wide text-white/85 transition hover:border-white/40 hover:bg-white/10"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid h-[calc(96dvh-4.5rem)] place-items-center overflow-auto p-3 sm:p-8">
          <img
            ref={modalImageRef}
            src={src}
            alt={imageAlt}
            onLoad={() => {
              if (!baseFitSize) {
                requestAnimationFrame(() => {
                  captureBaseFitSize();
                });
              }
            }}
            className="object-contain"
            style={{
              width: renderedWidth ?? "100%",
              height: renderedHeight ?? "100%",
              maxWidth: renderedWidth ? "none" : "100%",
              maxHeight: renderedHeight ? "none" : "100%",
              transition: "width 140ms ease, height 140ms ease",
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
