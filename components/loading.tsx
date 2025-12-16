"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { useNetwork } from "@/components/context/Network";

export default function LoadingScreen() {
  const pathname = usePathname();
  const { pendingPath } = useNetwork();

  // Use the pendingPath if available (for the most immediate feedback)
  // Otherwise fall back to the current pathname
  const activePath = pendingPath || pathname;

  // Customize loading messages and appearance based on the path
  let message = "Loading...";
  let color = "border-white";
  let bgColor = "from-blue-500/20 to-purple-500/20";

  if (activePath.includes("/music")) {
    message = "Loading your music collection...";
    color = "border-blue-500";
    bgColor = "from-blue-500/30 to-indigo-500/30";
  } else if (activePath.includes("/photos")) {
    message = "Loading photo gallery...";
    color = "border-amber-500";
    bgColor = "from-amber-500/30 to-orange-500/30";
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50">
      <div className={`absolute inset-0 bg-linear-to-br ${bgColor} backdrop-blur-lg z-0`}></div>
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className={`w-16 h-16 border-4 ${color} border-t-transparent rounded-full animate-spin`}></div>
        <h2 className="text-xl font-semibold text-white">{message}</h2>
      </div>
    </div>
  );
}
