import type { SearchIndexEntry } from "@/lib/content/types";
import { getAllDocuments } from "@/lib/content";

const MAX_CONTENT_CHARS = 1400;

export async function buildSearchIndex(): Promise<SearchIndexEntry[]> {
  const documents = await getAllDocuments();

  return documents.map((document) => ({
    id: document.id,
    title: document.title,
    description: document.description,
    category: document.category,
    tags: document.tags ?? [],
    slug: document.slugPath,
    url: document.url,
    headings: document.headings,
    content: document.plainText.slice(0, MAX_CONTENT_CHARS),
  }));
}

export async function getSearchIndexPayload() {
  const entries = await buildSearchIndex();

  return {
    generatedAt: new Date().toISOString(),
    count: entries.length,
    entries,
  };
}
