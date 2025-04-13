"use client";

import React, { createContext, useContext, useCallback, ReactNode, RefObject } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ScrollContextType {
  scrollToPage: (routePath: string) => void;
  setScrollRef: (ref: HTMLDivElement) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

export const useScroll = () => {
  const ctx = useContext(ScrollContext);
  if (!ctx) {
    throw new Error("useScroll must be used within ScrollContext");
  }
  return ctx;
};

export const ScrollProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const setScrollRef = (ref: HTMLDivElement) => {
    scrollRef.current = ref;
  };

  const scrollToPage = useCallback(
    (routePath: string) => {
      // Navigate to the new route with scroll: false to prevent auto-scrolling
      router.push(routePath, { scroll: false });
    },
    [router],
  );

  return <ScrollContext.Provider value={{ scrollToPage, setScrollRef, scrollRef }}>{children}</ScrollContext.Provider>;
};
