"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

type TocMode = "mobile" | "desktop" | "responsive";

function TocList({
  items,
  activeId,
  onNavigate,
}: {
  items: TocItem[];
  activeId: string | null;
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  return (
    <ol className="space-y-3 text-sm text-gray-300">
      {items.map((item) => {
        const isActive = activeId === item.id;

        return (
          <li key={item.id} className={cn(item.level === 3 && "pl-4", item.level === 4 && "pl-8")}>
            <a
              href={`#${item.id}`}
              onClick={(event) => onNavigate(event, item.id)}
              aria-current={isActive ? "location" : undefined}
              title={`Jump to ${item.text}`}
              className={cn(
                "cursor-pointer rounded-sm leading-6 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45",
                isActive ? "font-medium text-white" : "hover:text-white",
              )}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function TableOfContentsClient({ items, mode = "responsive" }: { items: TocItem[]; mode?: TocMode }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  const headingIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    if (headingIds.length === 0) {
      setActiveId(null);
      return;
    }

    const headings = headingIds
      .map((id) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (headings.length === 0) {
      setActiveId(headingIds[0] ?? null);
      return;
    }

    const scrollRoot = document.querySelector<HTMLElement>("[data-brain-scroll-root]");
    const scrollTarget: Window | HTMLElement = scrollRoot ?? window;

    const updateActiveHeading = () => {
      const offset = 140;
      let nextActiveId = headings[0].id;
      const rootTop = scrollRoot ? scrollRoot.getBoundingClientRect().top : 0;

      for (const heading of headings) {
        const headingTop = heading.getBoundingClientRect().top - rootTop;

        if (headingTop - offset <= 0) {
          nextActiveId = heading.id;
        } else {
          break;
        }
      }

      setActiveId(nextActiveId);
    };

    updateActiveHeading();

    scrollTarget.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);

    return () => {
      scrollTarget.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [headingIds]);

  const handleNavigate = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    event.preventDefault();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {(mode === "mobile" || mode === "responsive") && (
        <details className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-200 backdrop-blur-sm lg:hidden">
          <summary title="Toggle table of contents" className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
            On This Page
          </summary>
          <div className="mt-4">
            <TocList items={items} activeId={activeId} onNavigate={handleNavigate} />
          </div>
        </details>
      )}

      {(mode === "desktop" || mode === "responsive") && (
        <aside className="hidden lg:block">
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-gray-200 backdrop-blur-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-gray-300">On This Page</p>
            <TocList items={items} activeId={activeId} onNavigate={handleNavigate} />
          </div>
        </aside>
      )}
    </>
  );
}
