"use client";

import React from "react";
import { useNetwork } from "@/components/context/Network";

type NavigationButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function NavigationButton({ href, children, className = "" }: NavigationButtonProps) {
  const { setPage } = useNetwork();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use the enhanced setPage function from NetworkContext
    // This will show loading UI immediately, before URL change
    setPage(href);
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
