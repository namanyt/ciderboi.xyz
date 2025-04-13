"use client";

import React, { createContext, useContext, useCallback, ReactNode, useState, useEffect, RefObject } from "react";

interface ScrollContextType {
  page: number;
  setPage: (page: number) => void;
  scrollToPage: (index: number) => void;
  setScrollRef: (ref: HTMLDivElement) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

export type PageType = {
  name: string;
  obj: any;
  default: boolean;
};

export const useScroll = () => {
  const ctx = useContext(ScrollContext);
  if (!ctx) {
    throw new Error("useScroll must be used within ScrollContext");
  }
  return ctx;
};

export const ScrollProvider = ({
  pages,
  scrollRef,
  children,
}: {
  pages: PageType[];
  scrollRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) => {
  const [page, setPage] = useState(pages.findIndex((p) => p.default));
  // const scrollRef = useRef<HTMLDivElement>(null);

  const setScrollRef = (ref: HTMLDivElement) => {
    scrollRef.current = ref;
  };

  const scrollToPage = useCallback((index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current?.scrollTo({
      left: index * window.innerWidth,
      behavior: "smooth",
    });
    setPage(index);

    const hash = pages[index]?.name?.toLowerCase().replace("\/s+/g", "");
    if (hash) window.history.replaceState(null, "", `#${hash}`);
  }, []);

  useEffect(() => {
    // On mount: scroll to the hash in the URL (if present)
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const index = pages.findIndex((p) => p.name.toLowerCase().replace(/\s+/g, "") === hash.toLowerCase());

    if (index !== -1) {
      scrollToPage(index);
    }
  }, [scrollToPage, pages]);

  useEffect(() => {
    // Handle back/forward navigation
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const index = pages.findIndex((p) => p.name.toLowerCase().replace(/\s+/g, "") === hash.toLowerCase());

      if (index !== -1) {
        scrollToPage(index);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [scrollToPage, pages]);

  return (
    <ScrollContext.Provider value={{ page, setPage, scrollToPage, setScrollRef, scrollRef }}>
      {children}
    </ScrollContext.Provider>
  );
};
