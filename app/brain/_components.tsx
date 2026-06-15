import Link from "next/link";
import type { ReactNode } from "react";
import { TableOfContentsClient } from "./_toc-client";

type BreadcrumbItem = {
  name: string;
  href: string;
};

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

type TocMode = "mobile" | "desktop" | "responsive";

export function BrainBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-200">
      <ol className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-sm md:w-fit md:px-5">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 ? <span className="text-gray-500">/</span> : null}
            <Link href={item.href} className="transition hover:text-white">
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function TableOfContents({ items, mode = "responsive" }: { items: TocItem[]; mode?: TocMode }) {
  return <TableOfContentsClient items={items} mode={mode} />;
}
