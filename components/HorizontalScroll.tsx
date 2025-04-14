"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useScroll } from "@/components/context/Scroll";
import { BackgroundPicture } from "@/components/BackgroundPicture";
import LoadingScreen from "@/components/loading";

// Define our routes in the exact order they should appear in the scroll
const ROUTES = ["/music", "/", "/photos"];

export default function HorizontalLayout({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [brightness, setBrightness] = React.useState(0.8);
  const pathname = usePathname();
  const router = useRouter();
  const { setScrollRef } = useScroll();

  // Find the current page index based on the pathname
  const currentIndex = ROUTES.indexOf(pathname);

  // Handle scroll to change routes
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;

    // Determine which page we're closest to
    const pageIndex = Math.round(scrollLeft / width);

    // If we've scrolled to a different page, update the URL
    if (pageIndex >= 0 && pageIndex < ROUTES.length && ROUTES[pageIndex] !== pathname) {
      router.push(ROUTES[pageIndex], { scroll: false });
    }
  };

  // Scroll to the correct position when pathname changes
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // If route is valid, scroll to the correct page
    if (currentIndex !== -1) {
      container.scrollTo({
        left: currentIndex * window.innerWidth,
        behavior: "auto",
      });
    }

    requestAnimationFrame(() => setLoaded(true));

    if (scrollRef.current) setScrollRef(scrollRef.current);
  }, [pathname, setScrollRef, loaded, currentIndex]);

  // Set up scroll event listeners
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Debounce function to limit how often handleScroll fires
    let scrollTimeout: NodeJS.Timeout;
    const debouncedScrollHandler = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    container.addEventListener("scrollend", handleScroll); // Modern browsers
    container.addEventListener("scroll", debouncedScrollHandler);

    // Prevent default scroll behaviors
    const preventHorizontalScroll = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
    };

    const blockHorizontalKeys = (e: KeyboardEvent) => {
      const keys = ["ArrowLeft", "ArrowRight", "PageUp", "PageDown"];
      if (keys.includes(e.key)) e.preventDefault();
    };

    document.body.style.overflow = "hidden";
    container.addEventListener("wheel", preventHorizontalScroll, { passive: false });
    window.addEventListener("keydown", blockHorizontalKeys, { passive: false });

    return () => {
      clearTimeout(scrollTimeout);
      container.removeEventListener("scrollend", handleScroll);
      container.removeEventListener("scroll", debouncedScrollHandler);
      container.removeEventListener("wheel", preventHorizontalScroll);
      window.removeEventListener("keydown", blockHorizontalKeys);
      document.body.style.overflow = "auto";
    };
  }, [pathname]);

  return (
    <div className="hide-scrollbar relative w-screen h-screen overflow-hidden">
      <BackgroundPicture brightness={brightness} />

      <div className={`${!loaded ? "opacity-0 pointer-events-none" : "opacity-100"} transition-opacity duration-300`}>
        <div
          ref={scrollRef}
          className="flex w-screen h-screen overflow-x-auto hide-scrollbar"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {/* We render all routes, but only the matching one will contain content */}
          {ROUTES.map((route) => (
            <div
              key={route}
              className="flex items-center justify-center w-screen h-screen flex-shrink-0"
              style={{ scrollSnapAlign: "center" }}
            >
              {pathname === route && (
                <div key={route} className="w-full h-full">
                  <React.Suspense fallback={<LoadingScreen />}>{children}</React.Suspense>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
