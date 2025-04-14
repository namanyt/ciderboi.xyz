"use client";

import React from "react";
import { usePathname } from "next/navigation";

// Define our routes in the exact order they should appear in the scroll
const ROUTES = ["/music", "/", "/photos"];

type PageTransitionProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();

  // Determine the position of the current route relative to others
  const getDirection = () => {
    const currentIndex = ROUTES.indexOf(pathname);
    const centerIndex = ROUTES.indexOf("/");

    // Default animation from right
    if (currentIndex === -1) return 1;

    // From the left if we're moving right from center
    return currentIndex > centerIndex ? 1 : -1;
  };

  const direction = getDirection();

  return <div className={className}>{children}</div>;
}
