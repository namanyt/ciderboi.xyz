import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BrainBreadcrumbs, JsonLd } from "@/app/brain/_components";
import { getAllTags, getCanonicalUrl, getDocumentsByTag } from "@/lib/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag: tag.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const documents = await getDocumentsByTag(tag);

  if (documents.length === 0) {
    return { title: "Tag Not Found" };
  }

  const title = `#${tag}`;
  const description = `Documents and notes tagged with ${tag}.`;

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(`/brain/tag/${tag}`),
    },
    openGraph: {
      title,
      description,
      url: getCanonicalUrl(`/brain/tag/${tag}`),
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function BrainTagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const [documents, tags] = await Promise.all([getDocumentsByTag(tag), getAllTags()]);

  if (documents.length === 0) {
    notFound();
  }

  const currentTag = tags.find((entry) => entry.slug === tag);
  const relatedTags = currentTag?.relatedTags ?? [];

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Brain", href: "/brain" },
    { name: `#${tag}`, href: `/brain/tag/${tag}` },
  ];

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
    <div className="h-dvh overflow-y-auto overflow-x-hidden hide-scrollbar">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 pb-28 sm:px-6 sm:py-12">
        <JsonLd data={breadcrumbSchema} />
        <BrainBreadcrumbs items={breadcrumbItems} />

        <header className="mb-10 border-b border-white/10 pb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Tag</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">#{tag}</h1>
          <p className="mt-4 text-sm text-gray-500">{documents.length} documents</p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Related Tags</h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {relatedTags.length === 0 ? <p className="text-sm text-gray-400">No related tags found yet.</p> : null}
            {relatedTags.map((relatedTag) => (
              <Link
                key={relatedTag}
                href={`/brain/tag/${relatedTag}`}
                className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm text-gray-200 transition hover:bg-white/20 hover:text-white"
              >
                #{relatedTag}
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 pt-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Documents</h2>
          <div className="mt-6 divide-y divide-white/10">
            {documents.map((document) => (
              <Link key={document.id} href={document.url} className="block py-4 transition hover:bg-white/[0.03]">
                <p className="text-lg font-medium text-white">{document.title}</p>
                <p className="mt-1 text-sm leading-7 text-gray-300">{document.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
