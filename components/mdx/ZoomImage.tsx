"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [baseFitSize, setBaseFitSize] = useState<{ width: number; height: number } | null>(null);
  const modalImageRef = useRef<HTMLImageElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const normalizedClassName = className?.trim() ?? "";
  const hasCustomSizing = normalizedClassName.length > 0;

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

  const centerScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const { scrollWidth, scrollHeight, clientWidth, clientHeight } = container;
        container.scrollLeft = Math.max(0, (scrollWidth - clientWidth) / 2);
        container.scrollTop = Math.max(0, (scrollHeight - clientHeight) / 2);
      });
    });
  }, []);

  useLayoutEffect(() => {
    if (!isDialogOpen || !baseFitSize) {
      return;
    }

    centerScroll();
  }, [isDialogOpen, baseFitSize, centerScroll]);

  const previewClassName = hasCustomSizing ? normalizedClassName : "";
  const usesFullWidthLayout = hasCustomSizing
    && Boolean(previewClassName.match(/(^|\s)(w-full|aspect-|h-full)(\s|$)/));
  const triggerClassName = hasCustomSizing
    ? usesFullWidthLayout
      ? "group my-8 block w-full overflow-hidden rounded-2xl border border-white/15 bg-black/20 text-left shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)] backdrop-blur-sm transition hover:border-white/30 hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.85)]"
      : "group my-8 mx-auto inline-flex w-fit max-w-full overflow-hidden rounded-2xl border border-white/15 bg-black/20 p-2 text-left shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)] backdrop-blur-sm transition hover:border-white/30 hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.85)]"
    : "brain-media not-prose group w-full";

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);

        if (isOpen) {
          setZoom(1);
          setBaseFitSize(null);
          requestAnimationFrame(() => {
            if (modalImageRef.current?.complete) {
              captureBaseFitSize();
            }
            centerScroll();
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
              hasCustomSizing && "block transition duration-300 group-hover:scale-[1.01]",
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

      <DialogContent className="flex h-dvh max-w-full flex-col overflow-hidden border-white/15 bg-black/95 p-0 text-white shadow-2xl">
        <DialogTitle className="sr-only">{imageAlt}</DialogTitle>

        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3 sm:text-sm">
          <p className="truncate text-sm text-white/85 sm:text-base">{imageAlt}</p>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={!canZoomOut}
              onClick={() => setZoom((current) => clamp(current - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))}
              className="rounded-md border border-white/20 px-2.5 py-1 text-xs uppercase tracking-wide text-white/85 transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-1.5"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="min-w-[3.5rem] text-center text-xs text-white/70 sm:min-w-16">{zoomPercent}%</span>
            <button
              type="button"
              disabled={!canZoomIn}
              onClick={() => setZoom((current) => clamp(current + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))}
              className="rounded-md border border-white/20 px-2.5 py-1 text-xs uppercase tracking-wide text-white/85 transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-1.5"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                requestAnimationFrame(() => {
                  captureBaseFitSize();
                  centerScroll();
                });
              }}
              className="rounded-md border border-white/20 px-2.5 py-1 text-xs uppercase tracking-wide text-white/85 transition hover:border-white/40 hover:bg-white/10 sm:px-3 sm:py-1.5"
            >
              <span className="sm:hidden">Rst</span>
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-md border border-white/20 px-2.5 py-1 text-xs uppercase tracking-wide text-white/85 transition hover:border-white/40 hover:bg-white/10 sm:px-3 sm:py-1.5"
              aria-label="Close zoom view"
            >
              ×
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="grid flex-1 place-items-center overflow-auto p-2 sm:p-3 md:p-8"
        >
          <img
            ref={modalImageRef}
            src={src}
            alt={imageAlt}
            onLoad={() => {
              requestAnimationFrame(() => {
                captureBaseFitSize();
                centerScroll();
              });
            }}
            className="max-h-full max-w-full object-contain"
            style={{
              width: renderedWidth ?? undefined,
              height: renderedHeight ?? undefined,
              transition: "width 140ms ease, height 140ms ease",
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
