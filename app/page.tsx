"use client";

import LoadingScreen from "@/components/loading";
import { backgroundImageBlurDataURL } from "@/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { Suspense, useEffect, useRef } from "react";

const pages = [
  { name: 'Music Production', obj: dynamic(() => import("../components/pages/Music"), { ssr: false }), default: false },
  { name: 'About Me', obj: dynamic(() => import("../components/pages/Home"), { ssr: false }), default: true },
  { name: 'Photography', obj: dynamic(() => import("../components/pages/Photo"), { ssr: false }), default: false },
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
    container.scrollTo({
      left: page * window.innerWidth,
      behavior: "auto",
    });
    requestAnimationFrame(() => setLoaded(true));
  }, []);

  return (
    <div className="hide-scrollbar relative w-screen h-screen overflow-hidden">
      <BackgroundPicture brightness={brightness} />

      {/* Responsive navigation buttons */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-wrap justify-center gap-2 px-4 w-full max-w-[90vw] sm:max-w-[35rem]">
        {pages.map((p, index) => (
          <button
            key={index}
            onClick={() => scroll(index)}
            className={`flex-1 min-w-[8rem] px-4 py-2 rounded-md font-medium text-center text-sm transition
              ${page === index
                ? "bg-white text-black"
                : "bg-white/50 text-gray-800 hover:bg-white"}`}
          >
            {p.name}
          </button>
        ))}
      </div>

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

function BackgroundPicture({ brightness = 0.8, scaling = 1 }: { brightness: number, scaling?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="/pictures/background.webp"
        alt="Background"
        fill
        placeholder="blur"
        blurDataURL={backgroundImageBlurDataURL()}
        quality={60}
        sizes="100vw"
        style={{
          filter: `blur(8px) brightness(${brightness})`,
          transform: `scale(${scaling})`,
          objectFit: "cover",
          zIndex: -1,
          transition: "filter 0.5s ease-in-out, transform 0.5s ease-in-out",
        }}
        priority
      />

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
        "ArrowLeft", "ArrowRight",
        "ArrowUp", "ArrowDown",
        "PageUp", "PageDown", " ",
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
      style={{ scrollSnapType: "x mandatory" }}
    >
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

