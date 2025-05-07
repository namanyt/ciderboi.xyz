"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhotoMetadata } from "@/lib/types";
import Image from "next/image";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { X, ZoomIn, ZoomOut, Instagram } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationButton from "@/components/NavigationButton";

const MOBILE_ENLARGED_SCALE = 1.2;
const MOBILE_SCALING = 1;
const DESKTOP_ENLARGED_SCALE = 1.5;
const DESKTOP_SCALING = 1;

export default function Photo({
  photos,
  photoId,
}: {
  photos: PhotoMetadata[];
  photoId: string | string[] | undefined;
}) {
  return (
    <div className="text-white w-full min-h-screen flex flex-col items-center py-12">
      <NavigationButton
        href={"/"}
        className="z-[60] fixed top-4 left-4 md:top-auto md:right-[1em] md:left-auto md:bottom-[1em] cursor-pointer w-auto px-6 py-2 rounded-full bg-white/30 hover:bg-white/40 transition border border-white/30 text-sm text-center shadow-md"
      >
        Back Home
      </NavigationButton>
      <h1 className="text-3xl sm:text-4xl mb-6 text-center font-semibold">Gallery</h1>

      <ScrollArea className="w-[90vw] h-full max-h-[calc(80vh)] overflow-y-auto">
        <div className="w-full max-w-[1800px] columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6 px-6">
          {photos.map((photo) => (
            <PhotoCard key={photo.uuid} photo={photo} isIdProvided={photoId} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

type MobilePhotoModalProps = {
  photo: PhotoMetadata;
  open: boolean;
  setOpen: (open: boolean) => void;
  enlarged: boolean;
  setEnlarged: (enlarged: boolean) => void;
};

// Mobile-optimized Photo Modal Component with transitions
export function MobilePhotoModal({ photo, open, setOpen, enlarged, setEnlarged }: MobilePhotoModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  // Handle transition effects
  useEffect(() => {
    if (open) {
      // Small delay to allow the DOM element to be created before animating in
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  // Handle transition complete - only relevant for closing
  const handleTransitionEnd = () => {
    if (!isVisible) {
      setOpen(false);
    }
  };

  // If closed and animation completed, don't render
  if (!open && !isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    router.push("/photos?id=");
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-all duration-300 ease-in-out
        ${isVisible ? "bg-black/80 opacity-100" : "bg-black/0 opacity-0"}`}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className={`relative w-full h-full max-w-[95vw] max-h-[95vh] bg-black/90 rounded-lg border border-white/10
          overflow-hidden flex flex-col transition-all duration-300 ease-in-out
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        {/* Header with close button */}
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

        {/* Scrollable content container */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Image section - takes about 60% of height */}
          <div className="relative w-full flex justify-center items-center p-4 min-h-[50vh]">
            <div className="relative touch-manipulation cursor-zoom-in" onClick={() => setEnlarged(!enlarged)}>
              <Image
                src={`/gallery/${photo.webpPath}`}
                alt={photo.uuid}
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

          {/* Info panel - stacked below image */}
          <div className="w-full p-5 bg-black/60 border-t border-white/10 text-white flex-shrink-0">
            <h3 className="text-lg font-medium mb-4">Photo Info</h3>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {photo.metadata.camera && (
                <div className="bg-black/30 p-3 rounded-lg">
                  <span className="font-medium text-white/80 block mb-1">Camera</span>
                  <span className="text-sm">{photo.metadata.camera}</span>
                </div>
              )}
              {photo.metadata.focalLength && (
                <div className="bg-black/30 p-3 rounded-lg">
                  <span className="font-medium text-white/80 block mb-1">Focal Length</span>
                  <span className="text-sm">{photo.metadata.focalLength}</span>
                </div>
              )}
              {photo.metadata.aperture && (
                <div className="bg-black/30 p-3 rounded-lg">
                  <span className="font-medium text-white/80 block mb-1">Aperture</span>
                  <span className="text-sm">ƒ/{photo.metadata.aperture}</span>
                </div>
              )}
              {photo.metadata.shutterSpeed && (
                <div className="bg-black/30 p-3 rounded-lg">
                  <span className="font-medium text-white/80 block mb-1">Shutter</span>
                  <span className="text-sm">{photo.metadata.shutterSpeed}</span>
                </div>
              )}
              {photo.metadata.iso && (
                <div className="bg-black/30 p-3 rounded-lg">
                  <span className="font-medium text-white/80 block mb-1">ISO</span>
                  <span className="text-sm">{photo.metadata.iso}</span>
                </div>
              )}
              {photo.metadata.make && (
                <div className="bg-black/30 p-3 rounded-lg">
                  <span className="font-medium text-white/80 block mb-1">Device</span>
                  <span className="text-sm">{photo.metadata.make}</span>
                </div>
              )}
            </div>

            {/* Instagram button - larger touch target */}
            {photo.url && (
              <button
                onClick={() => window.open(photo.url, "_blank")}
                className="w-full py-4 rounded-lg border border-white/20 hover:border-white/40 text-white
              bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
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
  setOpen: (open: boolean) => void;
  enlarged: boolean;
  setEnlarged: (enlarged: boolean) => void;
};

// Desktop-optimized Photo Modal Component with transitions
export function DesktopPhotoModal({ photo, open, setOpen, enlarged, setEnlarged }: DesktopPhotoModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  // Handle transition effects
  useEffect(() => {
    if (open) {
      // Small delay to allow the DOM element to be created before animating in
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  // Handle transition complete - only relevant for closing
  const handleTransitionEnd = () => {
    if (!isVisible) {
      setOpen(false);
    }
  };

  // If closed and animation completed, don't render
  if (!open && !isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    router.push("/photos?id=");
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out
        ${isVisible ? "bg-black/70 backdrop-blur-md opacity-100" : "bg-black/0 backdrop-blur-none opacity-0"}`}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className={`relative w-[92vw] h-[92vh] bg-black/80 rounded-lg border border-white/10 overflow-hidden
          transition-all duration-300 ease-in-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-50 p-2 rounded-full bg-black/90 border border-white/20 text-white hover:bg-gray-800 transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-light text-white text-center">Photo Details</h2>
        </div>

        {/* Side-by-side content layout */}
        <div className="flex flex-row h-[calc(100%-60px)]">
          {/* Left side - Photo container */}
          <div className="w-2/3 h-full flex items-center justify-center p-8 border-r border-white/10">
            <div
              className={`relative ${enlarged ? "cursor-zoom-out" : "cursor-zoom-in"} transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
              onClick={() => setEnlarged(!enlarged)}
            >
              <Image
                src={`/gallery/${photo.webpPath}`}
                alt={photo.uuid}
                width={enlarged ? photo.size.width * DESKTOP_ENLARGED_SCALE : photo.size.width * DESKTOP_SCALING}
                height={enlarged ? photo.size.height * DESKTOP_ENLARGED_SCALE : photo.size.height * DESKTOP_SCALING}
                className={`max-h-[80vh] max-w-full object-contain rounded-lg shadow-xl transition-all duration-300 ${enlarged ? "scale-125" : "scale-100"}`}
                priority
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEnlarged(!enlarged);
                }}
                className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 border border-white/20 text-white hover:bg-black/70 transition-all"
                aria-label={enlarged ? "Zoom out" : "Zoom in"}
              >
                {enlarged ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Right side - Info panel */}
          <div
            className={`w-1/3 h-full p-6 text-white overflow-y-auto transition-all duration-500 ease-in-out
              ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
          >
            <h3 className="text-xl font-medium mb-6">Photo Info</h3>
            <div className="space-y-4 mb-8">
              {photo.metadata.make && (
                <div className="flex flex-col">
                  <span className="font-medium text-white/80">Device</span>
                  <span className="text-lg">{photo.metadata.make}</span>
                </div>
              )}
              {photo.metadata.camera && (
                <div className="flex flex-col">
                  <span className="font-medium text-white/80">Camera</span>
                  <span className="text-lg">{photo.metadata.camera}</span>
                </div>
              )}
              {photo.metadata.datetime && (
                <div className="flex flex-col">
                  <span className="font-medium text-white/80">Date Taken</span>
                  <span className="text-lg">{photo.metadata.datetime}</span>
                </div>
              )}
              {photo.metadata.focalLength && (
                <div className="flex flex-col">
                  <span className="font-medium text-white/80">Focal Length</span>
                  <span className="text-lg">{photo.metadata.focalLength}</span>
                </div>
              )}
              {photo.metadata.aperture && (
                <div className="flex flex-col">
                  <span className="font-medium text-white/80">Aperture</span>
                  <span className="text-lg">ƒ/{photo.metadata.aperture}</span>
                </div>
              )}
              {photo.metadata.shutterSpeed && (
                <div className="flex flex-col">
                  <span className="font-medium text-white/80">Shutter Speed</span>
                  <span className="text-lg">{photo.metadata.shutterSpeed}</span>
                </div>
              )}
              {photo.metadata.iso && (
                <div className="flex flex-col">
                  <span className="font-medium text-white/80">ISO</span>
                  <span className="text-lg">{photo.metadata.iso}</span>
                </div>
              )}
            </div>

            {photo.url && (
              <button
                onClick={() => window.open(photo.url, "_blank")}
                className="w-full py-3 px-4 rounded-lg border border-white/20 hover:border-white/40 text-white
              bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
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

// PhotoCard component with responsive modal selection
function PhotoCard({ photo, isIdProvided }: { photo: PhotoMetadata; isIdProvided?: string | string[] | undefined }) {
  const [open, setOpen] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const scaling = 1;

  // Check if screen is mobile size on mount and when window resizes
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // check if id is same as photo id, if yes, open the modal
    if ((Array.isArray(isIdProvided) ? isIdProvided[0] : isIdProvided) === photo.uuid) {
      setOpen(true);
    }

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [isIdProvided]);

  const handleClick = () => {
    setOpen(true);
    const params = new URLSearchParams(searchParams);
    params.set("id", photo.uuid);
    router.push(`/photos?${params.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleClick}>
      <DialogTrigger asChild>
        <div className="cursor-pointer break-inside-avoid overflow-hidden rounded-xl shadow-lg bg-black/30 backdrop-blur-sm border border-white/5 hover:border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <Image
            src={`/gallery/${photo.webpPath}`}
            alt={photo.uuid}
            width={photo.size.width * scaling}
            height={photo.size.height * scaling}
            className="w-full h-auto transition-all duration-500 rounded-xl hover:brightness-110"
            placeholder="blur"
            blurDataURL={`/gallery/${photo.blurPath}`}
            loading="lazy"
          />
        </div>
      </DialogTrigger>

      {/* Conditionally render the appropriate modal based on screen size */}
      {isMobile ? (
        <MobilePhotoModal photo={photo} open={open} setOpen={setOpen} enlarged={enlarged} setEnlarged={setEnlarged} />
      ) : (
        <DesktopPhotoModal photo={photo} open={open} setOpen={setOpen} enlarged={enlarged} setEnlarged={setEnlarged} />
      )}
    </Dialog>
  );
}
