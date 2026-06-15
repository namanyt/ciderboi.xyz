import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { evaluate } from "@mdx-js/mdx";
import type { ReactNode } from "react";
import * as jsxDevRuntime from "react/jsx-dev-runtime";
import * as jsxRuntime from "react/jsx-runtime";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import { BrainBreadcrumbs, JsonLd, TableOfContents, type TocItem } from "@/app/brain/_components";
import { getMDXComponents } from "@/components/mdx";
import {
  generateStaticParams,
  getAdjacentDocuments,
  getBacklinks,
  getCanonicalUrl,
  getDocumentBySlug,
  getRelatedDocuments,
} from "@/lib/content";
import type { Document } from "@/lib/content/types";

export const dynamicParams = false;

type MDXContentComponent = (props: {
  components?: ReturnType<typeof getMDXComponents>;
}) => ReactNode;

const mdxRuntime = process.env.NODE_ENV === "production" ? jsxRuntime : { ...jsxRuntime, ...jsxDevRuntime };

const prettyCodeOptions = {
  theme: "github-dark-default",
  keepBackground: false,
  onVisitLine(node: { children: unknown[] }) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
};

function normalizeHeadingText(value: string): string {
  return value
    .replace(/\[(.*?)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
    .trim();
}

function slugifyHeading(value: string, slugCounts: Map<string, number>): string {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s/g, "-");

  const seen = slugCounts.get(base) ?? 0;
  slugCounts.set(base, seen + 1);
  return seen === 0 ? base : `${base}-${seen}`;
}

function createTableOfContents(source: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TocItem[] = [];
  const slugCounts = new Map<string, number>();

  for (const match of source.matchAll(headingRegex)) {
    const level = match[1].length as 2 | 3 | 4;
    const text = normalizeHeadingText(match[2]);

    if (!text) {
      continue;
    }

    items.push({
      id: slugifyHeading(text, slugCounts),
      text,
      level,
    });
  }

  return items;
}

async function renderDocumentBody(source: string): Promise<ReactNode> {
  const evaluatedModule = (await evaluate(source, {
    ...mdxRuntime,
    development: process.env.NODE_ENV !== "production",
    remarkPlugins: [remarkGfm, remarkMdx],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, prettyCodeOptions],
      [rehypeAutolinkHeadings, { behavior: "append", properties: { className: ["brain-heading-anchor"], "aria-label": "Jump to heading", title: "Jump to heading" } }],
    ],
  })) as { default: MDXContentComponent };

  const Content = evaluatedModule.default;
  return <Content components={getMDXComponents()} />;
}

function schemaTypeForCategory(category: string): "Article" | "TechArticle" | "Person" | "CreativeWork" | "SoftwareSourceCode" {
  switch (category) {
    case "software":
    case "projects":
      return "SoftwareSourceCode";
    case "research":
    case "setups":
    case "university":
      return "TechArticle";
    case "people":
      return "Person";
    case "music":
    case "photography":
      return "CreativeWork";
    default:
      return "Article";
  }
}

function breadcrumbItemsForDocument(document: Document) {
  const items = [
    { name: "Home", href: "/" },
    { name: "Brain", href: "/brain" },
  ];

  if (document.slug.length > 1) {
    const category = document.slug[0];
    items.push({ name: category, href: `/brain/${category}` });
  }

  items.push({ name: document.title, href: document.url });
  return items;
}

function formatDisplayDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export { generateStaticParams };

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug);

  if (!document || document.visibility !== "public" || document.index === false) {
    return {
      title: "Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = document.seoTitle ?? document.title;
  const description = document.seoDescription ?? document.description;
  const canonical = getCanonicalUrl(document.url);

  return {
    title,
    description,
    keywords: document.seoKeywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      publishedTime: document.created,
      modifiedTime: document.updated ?? document.created,
      tags: document.tags,
      images: document.featuredImage ? [document.featuredImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: document.featuredImage ? [document.featuredImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BrainDocumentPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug);

  if (!document || document.visibility !== "public" || document.index === false) {
    notFound();
  }

  const [content, relatedDocuments, backlinks, adjacent] = await Promise.all([
    renderDocumentBody(document.body),
    getRelatedDocuments(document, 10),
    getBacklinks(document),
    getAdjacentDocuments(document),
  ]);
  const tableOfContents = createTableOfContents(document.body);

  const breadcrumbItems = breadcrumbItemsForDocument(document);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": schemaTypeForCategory(document.category),
    headline: document.title,
    description: document.description,
    datePublished: document.created,
    dateModified: document.updated ?? document.created,
    url: getCanonicalUrl(document.url),
    keywords: document.tags,
    mainEntityOfPage: getCanonicalUrl(document.url),
    author: {
      "@type": "Person",
      name: "Nitya Naman",
    },
    publisher: {
      "@type": "Person",
      name: "Nitya Naman",
    },
    image: document.featuredImage ? [document.featuredImage] : undefined,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.href),
    })),
  };

  return (
    <div data-brain-scroll-root className="h-dvh overflow-y-auto overflow-x-hidden hide-scrollbar">
      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 pb-28 sm:px-6 sm:py-12">
        <a
          href="#brain-main-content"
          className="sr-only rounded-md border border-white/30 bg-black/70 px-3 py-2 text-sm text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to main content
        </a>

        <JsonLd data={[articleSchema, breadcrumbSchema]} />

        <Link
          href="/brain"
          aria-label="Back to Brain"
          title="Back to Brain"
          className="absolute right-4 top-6 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 sm:right-6 sm:top-8"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18 9 12l6-6" />
          </svg>
        </Link>

        <BrainBreadcrumbs items={breadcrumbItems} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
          <div id="brain-main-content" className="min-w-0">
            <header className="mb-8 border-b border-white/10 pb-8 sm:pb-10">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-400">{document.category}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{document.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-gray-200 sm:text-lg">{document.description}</p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs tracking-[0.16em] text-gray-300">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">Created {formatDisplayDate(document.created)}</span>
                {document.updated ? <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">Updated {formatDisplayDate(document.updated)}</span> : null}
                {document.status ? <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">Status {document.status}</span> : null}
              </div>

              {(document.tags ?? []).length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {document.tags?.map((tag) => (
                    <Link
                      key={tag}
                      href={`/brain/tag/${tag}`}
                      className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm text-gray-200 transition hover:bg-white/20 hover:text-white"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              ) : null}
            </header>

            <TableOfContents items={tableOfContents} mode="mobile" />

            <article className="rounded-[28px] border border-white/10 bg-white/10 px-5 py-6 shadow-2xl md:backdrop-blur-md sm:px-8 sm:py-8">
              <div className="brain-prose max-w-none overflow-x-hidden break-words">{content}</div>
            </article>

            <div className="mt-12 space-y-12 border-t border-white/10 pt-10">
              <section>
                <h2 className="text-2xl font-semibold tracking-tight text-white">Related Pages</h2>
                <div className="mt-5 divide-y divide-white/10">
                  {relatedDocuments.length === 0 ? <p className="py-3 text-sm text-gray-400">No related pages yet.</p> : null}
                  {relatedDocuments.map((entry) => (
                    <Link key={entry.id} href={entry.url} className="block py-4 transition hover:bg-white/[0.03]">
                      <p className="text-lg font-medium text-white">{entry.title}</p>
                      <p className="mt-1 text-sm leading-7 text-gray-300">{entry.description}</p>
                    </Link>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight text-white">Referenced By</h2>
                <div className="mt-5 divide-y divide-white/10">
                  {backlinks.length === 0 ? <p className="py-3 text-sm text-gray-400">No backlinks yet.</p> : null}
                  {backlinks.map((entry) => (
                    <Link key={entry.id} href={entry.url} className="block py-4 transition hover:bg-white/[0.03]">
                      <p className="text-lg font-medium text-white">{entry.title}</p>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            <nav className="mt-10 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2" aria-label="Document pagination">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Previous Page</p>
                {adjacent.previous ? (
                  <Link href={adjacent.previous.url} className="mt-3 block text-lg font-medium text-white transition hover:text-cyan-100">
                    {adjacent.previous.title}
                  </Link>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">None</p>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Next Page</p>
                {adjacent.next ? (
                  <Link href={adjacent.next.url} className="mt-3 block text-lg font-medium text-white transition hover:text-cyan-100">
                    {adjacent.next.title}
                  </Link>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">None</p>
                )}
              </div>
            </nav>
          </div>

          <TableOfContents items={tableOfContents} mode="desktop" />
        </div>
      </div>
    </div>
  );
}
