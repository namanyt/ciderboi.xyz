"use client";

import React from "react";
import { useScroll } from "@/components/context/Scroll";
import PageTransition from "@/components/PageTransition";

export default function Music() {
  const { scrollToPage } = useScroll();

  return (
    <PageTransition className="text-white w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-4xl mb-8">Music Page</h1>
      <button
        onClick={() => scrollToPage("/")}
        className="z-50 relative cursor-pointer w-32 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-sm text-center"
      >
        back
      </button>
    </PageTransition>
  );
}
