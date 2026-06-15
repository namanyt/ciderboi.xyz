import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/app/brain/_components";
import {
  getAllCategories,
  getAllTags,
  getCanonicalUrl,
  getFeaturedDocuments,
  getKnowledgeStats,
  getRecentDocuments,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Brain",
  description: "Public knowledge base, technical wiki, digital garden, and long-form documentation.",
  alternates: {
    canonical: getCanonicalUrl("/brain"),
  },
  openGraph: {
    title: "Brain | Nitya Naman",
    description: "Public knowledge base, technical wiki, digital garden, and long-form documentation.",
    url: getCanonicalUrl("/brain"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brain | Nitya Naman",
    description: "Public knowledge base, technical wiki, digital garden, and long-form documentation.",
  },
};

export default async function BrainHomePage() {
  const [featured, recent, categories, tags, stats] = await Promise.all([
    getFeaturedDocuments(6),
    getRecentDocuments(10),
    getAllCategories(),
    getAllTags(),
    getKnowledgeStats(),
  ]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Brain",
    description: "Public knowledge base, technical wiki, digital garden, and long-form documentation.",
    url: getCanonicalUrl("/brain"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: stats.totalDocuments,
    },
  };

  const featuredDocument = featured[0] ?? recent[0] ?? null;
  const popularTags = [...tags].sort((left, right) => right.count - left.count).slice(0, 24);

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-8 pb-28 sm:px-6 sm:py-12">
      <JsonLd data={schema} />

      <Link
        href="/"
        aria-label="Go to homepage"
        title="Home"
        className="absolute right-4 top-6 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 sm:right-6 sm:top-8"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      </Link>

      <header className="mb-14 border-b border-white/10 pb-8 sm:pb-10">
        <p className="text-xs uppercase tracking-[0.28em] text-gray-200">Documentations :3</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl"><span className="font-mono">Brain</span> Archive</h1>
      </header>

      <div className="space-y-14">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-300">Featured</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Featured Document</h2>
            </div>
          </div>

          {featuredDocument ? (
            <Link href={featuredDocument.url}>
              <section className="rounded-3xl border border-white/10 bg-black/30 p-5 shadow-2xl md:backdrop-blur-md sm:p-6">
                <h2 className="text-lg font-semibold tracking-tight text-white">{featuredDocument.title}</h2>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-300">{featuredDocument.category}</p>
                <div className="mt-2 space-y-3">
                  <p className="text-base leading-8 text-gray-200">{featuredDocument.description}</p>
                  <p className="inline-flex text-sm font-medium text-cyan-100 transition hover:text-white">
                    Open note
                  </p>
                </div>
              </section>
            </Link>
          ) : (
            <p className="text-sm text-gray-400">No featured documents yet.</p>
          )}
        </section>

        <section className="border-t border-white/10 pt-8">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-300">Browse</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Recent Documents</h2>
          <div className="mt-6 divide-y divide-white/10">
            {recent.map((document) => (
              <Link key={document.id} href={document.url} className="block py-4 transition hover:bg-white/[0.03]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-lg font-medium text-white">{document.title}</p>
                    <p className="mt-1 max-w-2xl text-sm leading-7 text-gray-200">{document.description}</p>
                  </div>
                  <p className="shrink-0 text-xs uppercase tracking-[0.2em] text-gray-300">{document.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 pt-8">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-300">Navigate</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Categories</h2>
          <div className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
            {categories.map((category) => (
              <Link key={category.slug} href={`/brain/${category.slug}`} className="border-b border-white/10 pb-4 transition hover:border-white/25">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-lg font-medium text-white">{category.name}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-200">{category.count} docs</p>
                </div>
                <p className="mt-2 text-sm leading-7 text-gray-300">{category.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 pt-8 pb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-300">Explore</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Popular Tags</h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {popularTags.map((tag) => (
              <Link key={tag.slug} href={`/brain/tag/${tag.slug}`} className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm text-gray-200 transition hover:bg-white/20 hover:text-white">
                #{tag.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
