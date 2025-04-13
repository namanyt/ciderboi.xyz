"use client";

import React from "react";
import { useScroll } from "@/components/context/Scroll";

export default function Music() {
  const { scrollToPage } = useScroll();

  return (
    <div className="text-white text-4xl">
      <h1>Music Page</h1>
      <button
        onClick={() => scrollToPage(1)}
        className="z-50 relative cursor-pointer w-32 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-sm text-center"
      >
        back
      </button>
    </div>
  );
}
