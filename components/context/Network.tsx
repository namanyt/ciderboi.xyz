"use client";

import React, { createContext, useContext, useCallback, ReactNode, RefObject, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface NetworkContextType {
  setPage: (routePath: string) => void;
  setRef: (ref: HTMLDivElement) => void;
  ref: RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  pendingPath: string | null;
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
  const currentPath = usePathname();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const setRef = (_ref: HTMLDivElement) => {
    ref.current = _ref;
  };

  // Reset loading state when the path actually changes
  useEffect(() => {
    if (pendingPath && currentPath === pendingPath) {
      // We've arrived at the destination, but data might still be loading
      // The Suspense boundary will handle showing the loading state
      setPendingPath(null);
    }
  }, [currentPath, pendingPath]);

  const setPage = useCallback(
    (routePath: string) => {
      // Show loading state immediately
      setIsLoading(true);
      // Store the path we're navigating to
      setPendingPath(routePath);

      // Small timeout to ensure the loading UI renders before navigation
      // This makes navigation feel more immediate to the user
      setTimeout(() => {
        // Navigate to the new route with scroll: false to prevent auto-scrolling
        router.push(routePath, { scroll: false });
      }, 10);
    },
    [router],
  );

  return (
    <NetworkContext.Provider value={{ setPage, setRef, ref, isLoading, pendingPath }}>
      {/* Show loading overlay immediately when navigation is triggered */}
      {isLoading && pendingPath && <ImmediateLoadingOverlay path={pendingPath} />}
      {children}
    </NetworkContext.Provider>
  );
};

export function ImmediateLoadingOverlay({ path }: { path: string }) {
  // Customize loading messages based on the destination path
  let message = "Loading...";
  const color = "border-white";
  const bgColor = "from-blue-900/10 to-purple-900/15";

  if (path.includes("/music")) {
    message = "Loading music collection...";
  } else if (path.includes("/photos")) {
    message = "Loading photo gallery...";
  }

  return (
    <div
      className={`opacity-100 transition-opacity duration-300 fixed inset-0 flex flex-col items-center justify-center z-50`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} backdrop-blur-sm z-0`}></div>
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className={`w-16 h-16 border-4 ${color} border-t-transparent rounded-full animate-spin`}></div>
        <h2 className="text-xl font-semibold text-white">{message}</h2>
      </div>
    </div>
  );
}
