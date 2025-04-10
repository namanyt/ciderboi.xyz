"use client";

import LoadingScreen from "@/components/loading";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { Suspense, useEffect, useRef } from "react";

// TODO: Change these to use the respective components
/*
1: About component / back button to page 3
2: Music component / back button to page 3
3: Home page having buttons to jump to each page
4: Photography component / back button to page 3
5: Links component / back button to page 3
*/

const pages: { name: string, obj: any, default?: boolean }[] = [
  { name: 'Music Production', obj: dynamic(() => import("../components/pages/Music"), { ssr: false }), default: false },
  { name: 'About Me', obj: dynamic(() => import("../components/pages/Home"), { ssr: false }), default: true },
  { name: 'Photogrpahy', obj: dynamic(() => import("../components/pages/Photo"), { ssr: false }), default: false },
];

export default function Root() {
  const [brightness, setBrightness] = React.useState(0.8);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = React.useState(pages.findIndex((p) => p.default) ?? 0);
  const [loaded, setLoaded] = React.useState(false);

  const scroll = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTo({
      left: index * window.innerWidth,
      behavior: "smooth",
    });

    setPage(index);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Jump instantly to page 3 (index 2) without animation
    container.scrollTo({
      left: page * window.innerWidth,
      behavior: "auto", // instant
    });

    // After next tick, show content
    requestAnimationFrame(() => setLoaded(true));
  }, []);

  return (
    <div className="hide-scrollbar">
      <BackgroundPicture brightness={brightness} />

      {/* Jump buttons */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[200] flex justify-between w-[30rem]">
        {pages.map((p, index) => (
          <button
            key={index}
            onClick={() => scroll(index)}
            className={`w-36 py-2 rounded-sm font-medium text-center transition
        ${page === index
                ? "bg-white text-black"
                : "bg-white/50 text-gray-800 hover:bg-white"}`}
          >
            {p.name}
          </button>
        ))}
      </div>


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

function BackgroundPicture({ brightness = 0.8 }: { brightness: number }) {
  const scaling = 1;

  return (
    <div className="absolute inset-0 overflow-hidden hide-scrollbar">
      {/* background image */}
      <Image
        src="/pictures/background.jpg"
        alt="Background"
        width={4032 / scaling}
        height={2268 / scaling}
        style={{
          filter: `blur(8px) brightness(${brightness})`,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: -1,
          transition: "filter 0.5s ease-in-out",
        }}
      />

      {/* info about the image for screen reader */}
      <div
        className="sr-only"
        aria-hidden="true"
        role="img"
        aria-label="A beautiful background image"
      >
        A landscape scene of Derahdun, Haridwar, India. Picture taken by Nitya
        Naman using a Samsung Galaxy A54 phone.
      </div>
    </div>
  );
}

const HorizontalScroll = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>(({ children }, ref) => {
  useEffect(() => {
    const container = ref as React.RefObject<HTMLDivElement>;
    const el = container.current;
    if (!el) return;

    const preventDefault = (e: Event) => e.preventDefault();

    const blockKeys = (e: KeyboardEvent) => {
      const keys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        " ",
      ];
      if (keys.includes(e.key)) e.preventDefault();
    };

    document.body.style.overflow = "hidden";

    el.addEventListener("wheel", preventDefault, { passive: false });
    el.addEventListener("touchmove", preventDefault, { passive: false });
    window.addEventListener("keydown", blockKeys, { passive: false });

    return () => {
      el.removeEventListener("wheel", preventDefault);
      el.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("keydown", blockKeys);
      document.body.style.overflow = "auto";
    };
  }, [ref]);

  return (
    <div
      ref={ref}
      className="flex w-screen h-screen overflow-hidden"
      style={{
        scrollSnapType: "x mandatory",
      }}
    >
      {React.Children.map(children, (child) => (
        <div
          style={{
            flexShrink: 0,
            width: "100vw",
            height: "100vh",
            scrollSnapAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
});
