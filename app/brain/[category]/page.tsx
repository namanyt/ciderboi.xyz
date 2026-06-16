import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BrainBreadcrumbs, JsonLd } from "@/app/brain/_components";
import { getAllCategories, getCanonicalUrl, getDocumentsByCategory, getDefaultCategoryDescription } from "@/lib/content";

export const dynamicParams = false;

function toDisplayName(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatDisplayDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const documents = await getDocumentsByCategory(category);

  if (documents.length === 0) {
    return {
      title: "Category Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const displayName = toDisplayName(category);
  const description = getDefaultCategoryDescription(category);

  return {
    title: `${displayName} | Brain`,
    description,
    alternates: {
      canonical: getCanonicalUrl(`/brain/${category}`),
    },
    openGraph: {
      title: `${displayName} | Brain`,
      description,
      url: getCanonicalUrl(`/brain/${category}`),
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${displayName} | Brain`,
      description,
    },
  };
}

export default async function BrainCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const documents = await getDocumentsByCategory(category);

  if (documents.length === 0) {
    notFound();
  }

  const displayName = toDisplayName(category);
  const description = getDefaultCategoryDescription(category);

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Brain", href: "/brain" },
    { name: displayName, href: `/brain/${category}` },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${displayName} | Brain`,
    description,
    url: getCanonicalUrl(`/brain/${category}`),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: documents.length,
    },
  };

  return (
    <div className="h-dvh overflow-y-auto overflow-x-hidden hide-scrollbar">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 pb-28 sm:px-6 sm:py-12">
        <JsonLd data={schema} />
        <BrainBreadcrumbs items={breadcrumbItems} />

        <header className="mb-10 border-b border-white/10 pb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Category</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">{displayName}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-300">{description}</p>
          <p className="mt-4 text-sm text-gray-500">{documents.length} documents</p>
        </header>

        <section className="divide-y divide-white/10">
          {documents.map((document) => (
            <Link key={document.id} href={document.url} className="block py-5 transition hover:bg-white/[0.03]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-lg font-medium text-white">{document.title}</p>
                  <p className="mt-1 text-sm leading-7 text-gray-300">{document.description}</p>
                  {document.downloadPath ? (
                    <p className="mt-2 inline-flex rounded-full border border-cyan-300/30 bg-cyan-200/10 px-2.5 py-1 text-xs uppercase tracking-[0.16em] text-cyan-100">
                      Downloadable Artifact
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 text-xs uppercase tracking-[0.18em] text-gray-400">
                  <p>{document.updated ? `Updated ${formatDisplayDate(document.updated)}` : `Created ${formatDisplayDate(document.created)}`}</p>
                  {document.version ? <p className="mt-1">Version {document.version}</p> : null}
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
