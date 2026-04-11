"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhotoMetadata } from "@/lib/types";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, Instagram } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationButton from "@/components/NavigationButton";

const MOBILE_ENLARGED_SCALE = 1.2;
const MOBILE_SCALING = 1;
const DESKTOP_SCALING = 1;
const OPEN_DURATION_MS = 420;
const CLOSE_DURATION_MS = 320;
const IMAGE_REVEAL_MS = 180;
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/:.-";

type SharedRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  borderRadius: number;
};

type MetadataField = {
  label: string;
  value: string;
};

type TransitionPhase = "closed" | "opening" | "open" | "closing";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function measureRect(element: HTMLElement | null): SharedRect | null {
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  const borderRadius = Number.parseFloat(styles.borderTopLeftRadius) || 24;

  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    borderRadius,
  };
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

function useScrambledText(text: string, active: boolean, delayMs: number) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!active) {
      const resetFrame = window.requestAnimationFrame(() => setDisplayText(""));
      return () => window.cancelAnimationFrame(resetFrame);
    }

    let frameId = 0;
    let intervalId = 0;
    const startAt = window.setTimeout(() => {
      let progress = 0;

      const renderText = () => {
        const visibleCount = Math.min(text.length, Math.floor(progress));
        const scrambleBandEnd = Math.min(text.length, visibleCount + 3);

        const next = text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";

            if (index < visibleCount) return text[index];

            if (index < scrambleBandEnd) {
              return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }

            return " ";
          })
          .join("");

        frameId = window.requestAnimationFrame(() => setDisplayText(next));
      };

      renderText();

      intervalId = window.setInterval(() => {
        progress += 0.68;
        renderText();

        if (progress >= text.length + 1) {
          window.clearInterval(intervalId);
          frameId = window.requestAnimationFrame(() => setDisplayText(text));
        }
      }, 22);
    }, delayMs);

    return () => {
      window.clearTimeout(startAt);
      window.clearInterval(intervalId);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [active, delayMs, text]);

  return displayText;
}

function ScrambledMetadataValue({ text, active, delayMs }: { text: string; active: boolean; delayMs: number }) {
  const displayText = useScrambledText(text, active, delayMs);
  return <span className="block min-h-7 text-lg leading-7">{displayText}</span>;
}

function getMetadataFields(photo: PhotoMetadata): MetadataField[] {
  const fields: MetadataField[] = [];

  if (photo.metadata.make) fields.push({ label: "Device", value: photo.metadata.make });
  if (photo.metadata.camera) fields.push({ label: "Camera", value: photo.metadata.camera });
  if (photo.metadata.datetime) fields.push({ label: "Date Taken", value: photo.metadata.datetime });
  if (photo.metadata.focalLength) fields.push({ label: "Focal Length", value: photo.metadata.focalLength });
  if (photo.metadata.aperture) fields.push({ label: "Aperture", value: `f/${photo.metadata.aperture}` });
  if (photo.metadata.shutterSpeed) fields.push({ label: "Shutter Speed", value: photo.metadata.shutterSpeed });
  if (photo.metadata.iso) fields.push({ label: "ISO", value: String(photo.metadata.iso) });

  return fields;
}

export default function Photo({
  photos,
  photoId,
}: {
  photos: PhotoMetadata[];
  photoId: string | string[] | undefined;
}) {
  return (
    <>
      <NavigationButton
        href="/"
        className="z-60 fixed top-4 left-4 md:top-auto md:right-[1em] md:left-auto md:bottom-[1em] cursor-pointer w-auto px-6 py-2 rounded-full bg-white/30 hover:bg-white/40 transition border border-white/30 text-sm text-center shadow-md overflow-visible"
      >
        Back Home
      </NavigationButton>
      <div className="photo-gallery-panel w-[95vw] mx-auto my-6 p-8 rounded-3xl text-white overflow-y-auto scroll-smooth space-y-12">
        <h1 className="text-3xl sm:text-4xl mb-6 text-center font-semibold">Gallery</h1>

        <ScrollArea className="max-h-[calc(80vh)] overflow-y-auto">
          <div className="w-full max-w-[1800px] columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6 px-6">
            {photos.map((photo) => (
              <PhotoCard key={photo.uuid} photo={photo} isIdProvided={photoId} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

type MobilePhotoModalProps = {
  photo: PhotoMetadata;
  open: boolean;
  enlarged: boolean;
  setEnlarged: (enlarged: boolean) => void;
};

export function MobilePhotoModal({ photo, open, enlarged, setEnlarged }: MobilePhotoModalProps) {
  const router = useRouter();

  if (!open) {
    return null;
  }

  const handleClose = () => {
    router.push("/photos?id=");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 opacity-100 backdrop-blur-md transition-all duration-300 ease-in-out">
      <div className="relative flex h-full w-full max-h-[95vh] max-w-[95vw] flex-col overflow-hidden rounded-lg border border-white/10 bg-black/90 opacity-100 transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white">Photo Details</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full bg-black/90 border border-white/20 text-white hover:bg-gray-800 transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="relative w-full flex justify-center items-center p-4 min-h-[50vh]">
            <div className="relative touch-manipulation cursor-zoom-in" onClick={() => setEnlarged(!enlarged)}>
              <Image
                src={`/gallery/${photo.webpPath}`}
                alt={`Photography by Nitya Naman - ${photo.uuid}`}
                width={enlarged ? photo.size.width * MOBILE_ENLARGED_SCALE : photo.size.width * MOBILE_SCALING}
                height={enlarged ? photo.size.height * MOBILE_ENLARGED_SCALE : photo.size.height * MOBILE_SCALING}
                className={`max-h-[50vh] w-auto object-contain rounded-lg shadow-xl transition-all duration-300 ${enlarged ? "scale-110" : "scale-100"}`}
                priority
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEnlarged(!enlarged);
                }}
                className="absolute bottom-3 right-3 p-3 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/70 transition-all"
                aria-label={enlarged ? "Zoom out" : "Zoom in"}
              >
                {enlarged ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="w-full p-5 bg-black/60 border-t border-white/10 text-white shrink-0">
            <h3 className="text-lg font-medium mb-4">Photo Info</h3>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {getMetadataFields(photo).map((field) => (
                <div key={field.label} className="bg-black/30 p-3 rounded-lg">
                  <span className="font-medium text-white/80 block mb-1">{field.label}</span>
                  <span className="text-sm">{field.value}</span>
                </div>
              ))}
            </div>

            {photo.url && (
              <button
                onClick={() => window.open(photo.url, "_blank")}
                className="w-full py-4 rounded-lg border border-white/20 hover:border-white/40 text-white bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Instagram className="w-5 h-5" />
                <span>View on Instagram</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type DesktopPhotoModalProps = {
  photo: PhotoMetadata;
  open: boolean;
  zoomLevel: number;
  setZoomLevel: (zoomLevel: number) => void;
  sourceRect: SharedRect | null;
  onSourceReveal: () => void;
};

export function DesktopPhotoModal({
  photo,
  open,
  zoomLevel,
  setZoomLevel,
  sourceRect,
  onSourceReveal,
}: DesktopPhotoModalProps) {
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const targetCardRef = useRef<HTMLDivElement | null>(null);
  const targetImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const settleTimeoutRef = useRef<number | null>(null);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>(open ? "opening" : "closed");
  const [ghostRect, setGhostRect] = useState<SharedRect | null>(sourceRect);
  const [showGhost, setShowGhost] = useState(Boolean(open && sourceRect));
  const [isSettled, setIsSettled] = useState(false);
  const [isPaneVisible, setIsPaneVisible] = useState(false);
  const [isTargetVisible, setIsTargetVisible] = useState(false);
  const [isGhostFading, setIsGhostFading] = useState(false);

  const metadataFields = useMemo(() => getMetadataFields(photo), [photo]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
      if (settleTimeoutRef.current !== null) window.clearTimeout(settleTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    if (prefersReducedMotion || !sourceRect) {
      const settle = window.requestAnimationFrame(() => {
        setTransitionPhase("open");
        setGhostRect(null);
        setShowGhost(false);
        setIsGhostFading(false);
        setIsPaneVisible(true);
        setIsTargetVisible(true);
        settleTimeoutRef.current = window.setTimeout(() => setIsSettled(true), 0);
      });

      return () => window.cancelAnimationFrame(settle);
    }

    const bootstrap = window.requestAnimationFrame(() => {
      setTransitionPhase("opening");
      setIsSettled(false);
      setIsPaneVisible(false);
      setIsTargetVisible(false);
      setIsGhostFading(false);
      setGhostRect(sourceRect);
      setShowGhost(true);

      const startAnimation = window.requestAnimationFrame(() => {
        setIsPaneVisible(true);
        const targetRect = measureRect(targetImageRef.current);
        if (!targetRect) {
          setTransitionPhase("open");
          setIsTargetVisible(true);
          setIsSettled(true);
          settleTimeoutRef.current = window.setTimeout(() => {
            setIsGhostFading(true);
          }, IMAGE_REVEAL_MS);

          settleTimeoutRef.current = window.setTimeout(() => {
            setShowGhost(false);
          }, IMAGE_REVEAL_MS * 2);
          return;
        }

        const startedAt = performance.now();

        const tick = (now: number) => {
          const progress = clamp((now - startedAt) / OPEN_DURATION_MS, 0, 1);
          const eased = easeInOutCubic(progress);

          setGhostRect({
            left: lerp(sourceRect.left, targetRect.left, eased),
            top: lerp(sourceRect.top, targetRect.top, eased),
            width: lerp(sourceRect.width, targetRect.width, eased),
            height: lerp(sourceRect.height, targetRect.height, eased),
            borderRadius: lerp(sourceRect.borderRadius, targetRect.borderRadius, eased),
          });

          if (progress < 1) {
            animationFrameRef.current = window.requestAnimationFrame(tick);
            return;
          }

          setTransitionPhase("open");
          setIsTargetVisible(true);
          setIsSettled(true);
          window.setTimeout(() => {
            setIsGhostFading(true);
          }, IMAGE_REVEAL_MS);

          settleTimeoutRef.current = window.setTimeout(() => {
            setShowGhost(false);
          }, IMAGE_REVEAL_MS * 2);
        };

        animationFrameRef.current = window.requestAnimationFrame(tick);
      });

      animationFrameRef.current = startAnimation;
    });

    return () => window.cancelAnimationFrame(bootstrap);
  }, [open, photo, prefersReducedMotion, sourceRect]);

  const resetTilt = () => {
    const stage = stageRef.current;
    if (!stage) return;

    stage.style.setProperty("--photo-rotate-x", "0deg");
    stage.style.setProperty("--photo-rotate-y", "0deg");
    stage.style.setProperty("--photo-shift-x", "0px");
    stage.style.setProperty("--photo-shift-y", "0px");
    stage.style.setProperty("--photo-glow-x", "50%");
    stage.style.setProperty("--photo-glow-y", "50%");
  };

  const updateZoomLevel = (nextZoomLevel: number) => {
    setZoomLevel(clamp(nextZoomLevel, 1, 1.45));
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (transitionPhase !== "open") return;
    if (event.pointerType === "touch") return;
    if (prefersReducedMotion) return;

    const stage = stageRef.current;
    if (!stage) return;

    const bounds = stage.getBoundingClientRect();
    const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      const rotateX = (0.5 - y) * 8;
      const rotateY = (x - 0.5) * 9;
      const shiftX = (x - 0.5) * 6;
      const shiftY = (y - 0.5) * 5;

      stage.style.setProperty("--photo-rotate-x", `${rotateX.toFixed(2)}deg`);
      stage.style.setProperty("--photo-rotate-y", `${rotateY.toFixed(2)}deg`);
      stage.style.setProperty("--photo-shift-x", `${shiftX.toFixed(2)}px`);
      stage.style.setProperty("--photo-shift-y", `${shiftY.toFixed(2)}px`);
      stage.style.setProperty("--photo-glow-x", `${(x * 100).toFixed(2)}%`);
      stage.style.setProperty("--photo-glow-y", `${(y * 100).toFixed(2)}%`);
      animationFrameRef.current = null;
    });
  };

  const closeWithAnimation = () => {
    if (!open) return;

    resetTilt();
    setIsSettled(false);
    setIsPaneVisible(false);
    setIsTargetVisible(false);
    setIsGhostFading(false);

    if (prefersReducedMotion || !sourceRect) {
      onSourceReveal();
      router.push("/photos?id=");
      return;
    }

    const fromRect = measureRect(targetImageRef.current);
    if (!fromRect) {
      router.push("/photos?id=");
      return;
    }

    setTransitionPhase("closing");
    setGhostRect(fromRect);
    setShowGhost(true);

    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = clamp((now - startedAt) / CLOSE_DURATION_MS, 0, 1);
      const eased = easeInOutCubic(progress);

      setGhostRect({
        left: lerp(fromRect.left, sourceRect.left, eased),
        top: lerp(fromRect.top, sourceRect.top, eased),
        width: lerp(fromRect.width, sourceRect.width, eased),
        height: lerp(fromRect.height, sourceRect.height, eased),
        borderRadius: lerp(fromRect.borderRadius, sourceRect.borderRadius, eased),
      });

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      setIsGhostFading(true);
      onSourceReveal();
      router.push("/photos?id=");

      settleTimeoutRef.current = window.setTimeout(() => {
        setTransitionPhase("closed");
        setShowGhost(false);
        setGhostRect(null);
      }, IMAGE_REVEAL_MS);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);
  };

  const toggleEnlarged = () => {
    if (transitionPhase !== "open") return;
    updateZoomLevel(zoomLevel > 1.16 ? 1 : 1.28);
  };

  if (!open && transitionPhase === "closed") {
    return null;
  }

  return (
    <>
      <div
        className={`photo-modal-backdrop photo-modal-overlay fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out ${
          isPaneVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`photo-modal-shell photo-gallery-panel relative h-[calc(100vh-3rem)] w-[95vw] max-w-[1800px] overflow-hidden rounded-[2rem] border border-white/14 transition-all duration-300 ease-in-out ${
            isPaneVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={closeWithAnimation}
            className="absolute top-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/18 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="photo-modal-header border-b border-white/10 px-6 py-5">
            <h2 className="text-center text-xl font-light text-white">Photo Details</h2>
          </div>

          <div className="flex h-[calc(100%-76px)] flex-row">
            <div
              className="photo-modal-stage relative flex h-full w-2/3 items-center justify-center border-r border-white/10 p-10"
              onWheel={(event) => {
                if (transitionPhase !== "open") return;
                event.preventDefault();
                updateZoomLevel(zoomLevel - event.deltaY * 0.0012);
              }}
            >
              <div
                ref={stageRef}
                onPointerMove={handlePointerMove}
                onPointerLeave={resetTilt}
                onPointerCancel={resetTilt}
                className="photo-stage-tilt"
                style={
                  {
                    "--photo-rotate-x": "0deg",
                    "--photo-rotate-y": "0deg",
                    "--photo-shift-x": "0px",
                    "--photo-shift-y": "0px",
                    "--photo-glow-x": "50%",
                    "--photo-glow-y": "50%",
                    "--photo-scale": `${zoomLevel}`,
                  } as React.CSSProperties
                }
              >
                <div
                  ref={targetCardRef}
                  className={`photo-stage-card relative transition-opacity duration-200 ${isTargetVisible ? "opacity-100" : "opacity-0"} ${zoomLevel > 1.02 ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                  onClick={toggleEnlarged}
                >
                  <Image
                    ref={targetImageRef}
                    src={`/gallery/${photo.webpPath}`}
                    alt={`Photography by Nitya Naman - ${photo.uuid}`}
                    width={photo.size.width * DESKTOP_SCALING}
                    height={photo.size.height * DESKTOP_SCALING}
                    className="photo-stage-image"
                    priority
                  />
                </div>
              </div>

              <div
                className="photo-zoom-slider absolute right-6 bottom-6 z-20 flex items-center gap-3 rounded-full border border-white/14 px-3 py-2 text-white"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <ZoomOut className="h-4 w-4 text-white/62" />
                <input
                  type="range"
                  min="1"
                  max="1.45"
                  step="0.01"
                  value={zoomLevel}
                  onChange={(e) => updateZoomLevel(Number(e.target.value))}
                  className="photo-zoom-range"
                  aria-label="Zoom image"
                />
                <ZoomIn className="h-4 w-4 text-white/82" />
              </div>
            </div>

            <div className="photo-modal-sidebar h-full w-1/3 overflow-y-auto p-7 text-white transition-all duration-500 ease-in-out">
              <h3 className="mb-6 text-xl font-medium">Photo Info</h3>
              <div className="space-y-4 mb-8">
                {metadataFields.map((field, index) => (
                  <div key={field.label} className="photo-info-card flex flex-col">
                    <span className="font-medium text-white/72">{field.label}</span>
                    <ScrambledMetadataValue text={field.value} active={isSettled} delayMs={index * 55} />
                  </div>
                ))}
              </div>

              {photo.url && (
                <button
                  onClick={() => window.open(photo.url, "_blank")}
                  className="photo-instagram-button flex w-full cursor-pointer items-center justify-center gap-3 rounded-[1.2rem] border border-white/18 px-4 py-3 text-white transition-all duration-300 hover:bg-white/14"
                >
                  <Instagram className="w-5 h-5" />
                  <span>View on Instagram</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showGhost && ghostRect ? (
        <div
          className={`photo-shared-ghost transition-opacity duration-180 ${isGhostFading ? "opacity-0" : "opacity-100"}`}
          style={{
            left: `${ghostRect.left}px`,
            top: `${ghostRect.top}px`,
            width: `${ghostRect.width}px`,
            height: `${ghostRect.height}px`,
            borderRadius: `${ghostRect.borderRadius}px`,
          }}
        >
          <Image
            src={`/gallery/${photo.webpPath}`}
            alt={`Photography by Nitya Naman - ${photo.uuid}`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      ) : null}
    </>
  );
}

let photoRevealSequence = 0;

function PhotoCard({ photo, isIdProvided }: { photo: PhotoMetadata; isIdProvided?: string | string[] | undefined }) {
  const [enlarged, setEnlarged] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sourceRect, setSourceRect] = useState<SharedRect | null>(null);
  const [isSourceHidden, setIsSourceHidden] = useState(false);
  const [isSourceRestoring, setIsSourceRestoring] = useState(false);
  const [visibilityState, setVisibilityState] = useState<"hidden" | "visible" | "soft-hidden">("hidden");
  const [revealDelayMs, setRevealDelayMs] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const staggerTimeoutRef = useRef<number | null>(null);
  const scaling = 1;
  const open = (Array.isArray(isIdProvided) ? isIdProvided[0] : isIdProvided) === photo.uuid;

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          const delay = Math.min(photoRevealSequence * 65, 260);
          photoRevealSequence = (photoRevealSequence + 1) % 6;
          setRevealDelayMs(delay);

          if (staggerTimeoutRef.current !== null) {
            window.clearTimeout(staggerTimeoutRef.current);
          }

          staggerTimeoutRef.current = window.setTimeout(() => {
            setVisibilityState("visible");
            staggerTimeoutRef.current = null;
          }, delay);

          return;
        }

        if (staggerTimeoutRef.current !== null) {
          window.clearTimeout(staggerTimeoutRef.current);
          staggerTimeoutRef.current = null;
        }

        setVisibilityState((current) => (current === "hidden" ? "hidden" : "soft-hidden"));
      },
      {
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.16,
      },
    );

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      window.removeEventListener("resize", checkIsMobile);
      observer.disconnect();
      if (revealTimeoutRef.current !== null) {
        window.clearTimeout(revealTimeoutRef.current);
      }
      if (staggerTimeoutRef.current !== null) {
        window.clearTimeout(staggerTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    setIsSourceHidden(true);
    setZoomLevel(1);
    setSourceRect(measureRect(sourceImageRef.current) ?? measureRect(cardRef.current));
    const params = new URLSearchParams(searchParams);
    params.set("id", photo.uuid);
    router.push(`/photos?${params.toString()}`);
  };

  const handleSourceReveal = () => {
    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current);
    }

    setIsSourceRestoring(true);
    revealTimeoutRef.current = window.setTimeout(() => {
      setIsSourceHidden(false);
      window.requestAnimationFrame(() => setIsSourceRestoring(false));
      revealTimeoutRef.current = null;
    }, 0);
  };

  return (
    <>
      <div
        ref={cardRef}
        onClick={handleClick}
        className={`photo-gallery-card cursor-pointer break-inside-avoid overflow-hidden rounded-xl border border-white/5 bg-black/30 backdrop-blur-sm shadow-lg hover:border-white/20 hover:shadow-xl hover:scale-[1.02] ${
          isSourceHidden
            ? "opacity-0"
            : isSourceRestoring
              ? "photo-card-visible photo-card-restoring"
              : visibilityState === "visible"
                ? "photo-card-visible"
                : visibilityState === "soft-hidden"
                  ? "photo-card-soft-hidden"
                  : "photo-card-hidden"
        }`}
        style={{ transitionDelay: isSourceRestoring ? "0ms" : `${revealDelayMs}ms` }}
      >
        <Image
          ref={sourceImageRef}
          src={`/gallery/${photo.webpPath}`}
          alt="Photography by Nitya Naman - Gallery"
          width={photo.size.width * scaling}
          height={photo.size.height * scaling}
          className="w-full h-auto rounded-xl transition-all duration-500 hover:brightness-110"
          placeholder="blur"
          blurDataURL={`/gallery/${photo.blurPath}`}
          loading="lazy"
        />
      </div>

      {isMobile ? (
        <MobilePhotoModal photo={photo} open={open} enlarged={enlarged} setEnlarged={setEnlarged} />
      ) : (
        <DesktopPhotoModal
          photo={photo}
          open={open}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          sourceRect={sourceRect}
          onSourceReveal={handleSourceReveal}
        />
      )}
    </>
  );
}
