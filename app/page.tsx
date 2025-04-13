"use client";

import LoadingScreen from "@/components/loading";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect, useRef } from "react";
import { ScrollProvider, useScroll } from "@/components/context/Scroll";
import { BackgroundPicture } from "@/components/BackgroundPicture";

const pages = [
  { name: "music", obj: dynamic(() => import("../components/pages/Music"), { ssr: false }), default: false },
  { name: "home", obj: dynamic(() => import("../components/pages/Home"), { ssr: false }), default: true },
  { name: "photos", obj: dynamic(() => import("../components/pages/Photo"), { ssr: false }), default: false },
];

export default function Root() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollProvider pages={pages} scrollRef={scrollRef}>
      <App />
    </ScrollProvider>
  );
}

function App() {
  const [brightness, setBrightness] = React.useState(0.8);
  const [loaded, setLoaded] = React.useState(false);
  const { setScrollRef, page, scrollRef } = useScroll();

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({
      left: page * window.innerWidth,
      behavior: loaded ? "smooth" : "auto",
    });
    requestAnimationFrame(() => setLoaded(true));

    if (scrollRef.current) setScrollRef(scrollRef.current);
  }, [setScrollRef]);

  return (
    <div className="hide-scrollbar relative w-screen h-screen overflow-hidden">
      <BackgroundPicture brightness={brightness} />

      {/* Responsive navigation buttons */}
      {/*<div className="absolute top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-wrap justify-center gap-2 px-4 w-full max-w-[90vw] sm:max-w-[35rem]">*/}
      {/*  {pages.map((p, index) => (*/}
      {/*    <button*/}
      {/*      key={index}*/}
      {/*      onClick={() => scrollToPage(index)}*/}
      {/*      className={`flex-1 min-w-[8rem] px-4 py-2 rounded-md font-medium text-center text-sm transition*/}
      {/*        ${page === index ? "bg-white text-black" : "bg-white/50 text-gray-800 hover:bg-white"}`}*/}
      {/*    >*/}
      {/*      {p.name}*/}
      {/*    </button>*/}
      {/*  ))}*/}
      {/*</div>*/}

      {/* Page content */}
      <div className={`${!loaded ? "opacity-0 pointer-events-none" : "opacity-100"} transition-opacity duration-300`}>
        <HorizontalScroll ref={scrollRef}>
          {pages.map((DynamicPageOBJ, index) => (
            <Suspense fallback={<LoadingScreen />} key={index}>
              <DynamicPageOBJ.obj />
            </Suspense>
          ))}
        </HorizontalScroll>
      </div>
    </div>
  );
}

const HorizontalScroll = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => {
  useEffect(() => {
    const container = ref as React.RefObject<HTMLDivElement>;
    const el = container.current;
    if (!el) return;

    const preventHorizontalScroll = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
    };

    const blockHorizontalKeys = (e: KeyboardEvent) => {
      const keys = ["ArrowLeft", "ArrowRight", "PageUp", "PageDown"];
      if (keys.includes(e.key)) e.preventDefault();
    };

    document.body.style.overflow = "hidden"; // body should still be locked

    el.addEventListener("wheel", preventHorizontalScroll, { passive: false });
    window.addEventListener("keydown", blockHorizontalKeys, { passive: false });

    return () => {
      el.removeEventListener("wheel", preventHorizontalScroll);
      window.removeEventListener("keydown", blockHorizontalKeys);
      document.body.style.overflow = "auto";
    };
  }, [ref]);

  return (
    <div ref={ref} className="flex w-screen h-screen overflow-hidden" style={{ scrollSnapType: "x mandatory" }}>
      {React.Children.map(children, (child) => (
        <div
          className="flex items-center justify-center w-screen h-screen flex-shrink-0"
          style={{ scrollSnapAlign: "center" }}
        >
          {child}
        </div>
      ))}
    </div>
  );
});
HorizontalScroll.displayName = "HorizontalScroll";
