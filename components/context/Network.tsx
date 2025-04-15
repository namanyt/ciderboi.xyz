"use client";

import React, { createContext, useContext, useCallback, ReactNode, RefObject } from "react";
import { useRouter } from "next/navigation";

interface NetworkContextType {
  setPage: (routePath: string) => void;
  setRef: (ref: HTMLDivElement) => void;
  ref: RefObject<HTMLDivElement | null>;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

export const useNetwork = () => {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error("useNetwork must be used within NetworkContext");
  }
  return ctx;
};

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const ref = React.useRef<HTMLDivElement | null>(null);

  const setRef = (_ref: HTMLDivElement) => {
    ref.current = _ref;
  };

  const setPage = useCallback(
    (routePath: string) => {
      // Navigate to the new route with scroll: false to prevent auto-scrolling
      router.push(routePath, { scroll: false });
    },
    [router],
  );

  return <NetworkContext.Provider value={{ setPage, setRef, ref }}>{children}</NetworkContext.Provider>;
};
