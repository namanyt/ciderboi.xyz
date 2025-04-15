"use client";

import React from "react";
import { useNetwork } from "@/components/context/Network";

export default function Photo() {
  const { setPage } = useNetwork();

  return (
    <div className="text-white w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-4xl mb-8">Photos Page</h1>
      <button
        onClick={() => setPage("/")}
        className="z-50 relative cursor-pointer w-32 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-sm text-center"
      >
        back
      </button>
    </div>
  );
}
