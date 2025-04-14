"use client";

import React from "react";
import { useScroll } from "@/components/context/Scroll";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { scrollToPage } = useScroll();
  const pathname = usePathname();

  const routes = [
    { path: "/music", name: "Music" },
    { path: "/", name: "Home" },
    { path: "/photos", name: "Photos" },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-wrap justify-center gap-2 px-4 w-full max-w-[90vw] sm:max-w-[35rem]">
      {routes.map((route) => (
        <button
          key={route.path}
          onClick={() => scrollToPage(route.path)}
          className={`flex-1 min-w-[8rem] px-4 py-2 rounded-md font-medium text-center text-sm transition
            ${pathname === route.path ? "bg-white text-black" : "bg-white/50 text-gray-800 hover:bg-white"}`}
        >
          {route.name}
        </button>
      ))}
    </div>
  );
}
