import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type {
  Backlink,
  Category,
  Document,
  DocumentMetadata,
  GraphEdge,
  GraphNode,
  Tag,
  Visibility,
} from "@/lib/content/types";

const SITE_URL = "https://ciderboi.xyz";
const BRAIN_BASE_PATH = "/brain";
const CONTENT_ROOT = path.join(process.cwd(), "content");

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  projects: "Project architecture, implementation logs, and retrospectives.",
  thoughts: "Personal notes, reflections, and long-form writing.",
  research: "Technical deep dives, experiments, and source-backed findings.",
  university: "Semester notes, assignments, and study references.",
  setups: "Setup guides, tooling decisions, and environment walkthroughs.",
  music: "Production notes, release writeups, and creative process logs.",
  photography: "Photography workflows, field notes, and visual essays.",
  experiments: "Small technical experiments and prototype outcomes.",
  events: "Event summaries, talks, and participation notes.",
  documents: "Downloadable artifacts like resumes, CVs, and media or press kits.",
  software: "Software engineering notes and framework-specific guides.",
  hardware: "Hardware builds, benchmarks, and troubleshooting notes.",
  people: "Profiles, collaboration logs, and notable contributors.",
  misc: "Unsorted notes and temporary holding space.",
};

type CachedContent = {
  allDocuments: Document[];
  publicDocuments: Document[];
  idMap: Map<string, Document>;
  categoryMap: Map<string, Document[]>;
  tagMap: Map<string, Document[]>;
  backlinksMap: Map<string, Document[]>;
  linkedIdsByDocument: Map<string, Set<string>>;
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
};

let contentCache: CachedContent | null = null;

function toDateString(value: unknown, fallback: string): string {
  let parsed: Date;

  if (value instanceof Date) {
    parsed = value;
  } else if (typeof value === "string") {
    if (value.trim().length === 0) {
      return fallback;
    }
    parsed = new Date(value);
  } else if (typeof value === "number") {
    parsed = new Date(value);
  } else {
    return fallback;
  }

  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString().slice(0, 10);
}

function slugToTitle(part: string): string {
  return part
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, "-");
}

function normalizeCategory(category: string): string {
  return category.trim().toLowerCase().replace(/\s+/g, "-");
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
}

function sanitizeDownloadPath(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) {
    return undefined;
  }

  return trimmed;
}

function parseArchiveLinks(value: unknown): Array<{ title: string; href: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const maybeTitle = "title" in entry ? (entry.title as unknown) : undefined;
      const maybeHref = "href" in entry ? (entry.href as unknown) : undefined;

      if (typeof maybeTitle !== "string" || typeof maybeHref !== "string") {
        return null;
      }

      const title = maybeTitle.trim();
      const href = maybeHref.trim();

      if (!title || !href) {
        return null;
      }

      return { title, href };
    })
    .filter((entry): entry is { title: string; href: string } => Boolean(entry));
}

function cleanPlainText(content: string): string {
  return content
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+\$/g, " ")
    .replace(/```mermaid[\s\S]*?```/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[#>*_~\-]{1,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHeadings(content: string): string[] {
  const headings = content.match(/^#{1,6}\s+(.+)$/gm) ?? [];
  return headings.map((line) => line.replace(/^#{1,6}\s+/, "").trim());
}

function parseInternalBrainLinks(content: string): string[] {
  const links: string[] = [];
  const markdownLinkRegex = /\]\((\/brain\/[^)#?\s]+)[^)]*\)/g;

  let match = markdownLinkRegex.exec(content);
  while (match) {
    const rawPath = match[1].replace(/^\/brain\//, "").replace(/\/$/, "").trim();
    if (rawPath.length > 0) {
      links.push(rawPath);
    }
    match = markdownLinkRegex.exec(content);
  }

  return links;
}

async function scanMdxFiles(directoryPath: string): Promise<string[]> {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await scanMdxFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

function isPublicIndexable(document: Document): boolean {
  return (document.visibility ?? "public") === "public" && document.index !== false;
}

function getDocumentActivityTime(document: Document): number {
  return new Date(document.updated ?? document.created).getTime();
}

async function buildContentCache(): Promise<CachedContent> {
  const mdxFiles = await scanMdxFiles(CONTENT_ROOT);
  const documents: Document[] = [];

  for (const filePath of mdxFiles) {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = matter(raw);
    const stats = await fs.stat(filePath);

    const relativePath = path.relative(CONTENT_ROOT, filePath).replace(/\\/g, "/");
    const withoutExtension = relativePath.replace(/\.mdx$/, "");
    const slug = withoutExtension.split("/").filter(Boolean);

    const frontmatter = parsed.data as Partial<DocumentMetadata>;
    const plainText = cleanPlainText(parsed.content);

    const fallbackCreated = stats.mtime.toISOString().slice(0, 10);
    const category = normalizeCategory(frontmatter.category ?? slug[0] ?? "misc");

    const tags = Array.isArray(frontmatter.tags)
      ? Array.from(
        new Set(
          frontmatter.tags
            .map((tag) => toOptionalString(tag))
            .filter((tag): tag is string => Boolean(tag))
            .map((tag) => normalizeTag(tag)),
        ),
      )
      : [];

    const related = Array.isArray(frontmatter.related)
      ? Array.from(
        new Set(
          frontmatter.related
            .map((id) => toOptionalString(id))
            .filter((id): id is string => Boolean(id)),
        ),
      )
      : [];

    const visibility = (frontmatter.visibility ?? "public") as Visibility;
    const archiveLinks = parseArchiveLinks(frontmatter.archiveLinks);

    const document: Document = {
      id: (frontmatter.id ?? slug[slug.length - 1] ?? withoutExtension).trim(),
      title: toOptionalString(frontmatter.title) ?? slugToTitle(slug[slug.length - 1] ?? "Untitled"),
      description: toOptionalString(frontmatter.description) ?? plainText.slice(0, 180),
      category,
      documentType: toOptionalString(frontmatter.documentType),
      purpose: toOptionalString(frontmatter.purpose),
      version: toOptionalString(frontmatter.version),
      downloadPath: sanitizeDownloadPath(frontmatter.downloadPath),
      downloadLabel: toOptionalString(frontmatter.downloadLabel),
      archiveLinks: archiveLinks.length > 0 ? archiveLinks : undefined,
      created: toDateString(frontmatter.created, fallbackCreated),
      updated: frontmatter.updated ? toDateString(frontmatter.updated, fallbackCreated) : undefined,
      status: toOptionalString(frontmatter.status),
      visibility,
      index: frontmatter.index ?? true,
      featured: frontmatter.featured ?? false,
      tags,
      related,
      seoTitle: toOptionalString(frontmatter.seoTitle),
      seoDescription: toOptionalString(frontmatter.seoDescription),
      seoKeywords: Array.isArray(frontmatter.seoKeywords)
        ? Array.from(
          new Set(
            frontmatter.seoKeywords
              .map((keyword) => toOptionalString(keyword))
              .filter((keyword): keyword is string => Boolean(keyword)),
          ),
        )
        : undefined,
      featuredImage: toOptionalString(frontmatter.featuredImage),
      slug,
      slugPath: slug.join("/"),
      url: `${BRAIN_BASE_PATH}/${slug.join("/")}`,
      body: parsed.content,
      plainText,
      headings: extractHeadings(parsed.content),
    };

    documents.push(document);
  }

  const sortedDocuments = documents.sort((a, b) => {
    const aDate = new Date(a.updated ?? a.created).getTime();
    const bDate = new Date(b.updated ?? b.created).getTime();
    return bDate - aDate;
  });

  const idMap = new Map<string, Document>();
  const slugMap = new Map<string, Document>();
  const categoryMap = new Map<string, Document[]>();
  const tagMap = new Map<string, Document[]>();

  for (const document of sortedDocuments) {
    if (!idMap.has(document.id)) {
      idMap.set(document.id, document);
    }
    slugMap.set(document.slugPath, document);

    const categoryDocuments = categoryMap.get(document.category) ?? [];
    categoryDocuments.push(document);
    categoryMap.set(document.category, categoryDocuments);

    for (const tag of document.tags ?? []) {
      const tagDocuments = tagMap.get(tag) ?? [];
      tagDocuments.push(document);
      tagMap.set(tag, tagDocuments);
    }
  }

  const backlinksMap = new Map<string, Document[]>();
  const linkedIdsByDocument = new Map<string, Set<string>>();
  const graphEdges: GraphEdge[] = [];

  for (const document of sortedDocuments) {
    const linkedIds = new Set<string>();

    for (const relatedId of document.related ?? []) {
      const target = idMap.get(relatedId);
      if (!target) {
        continue;
      }

      linkedIds.add(target.id);
      const existing = backlinksMap.get(target.id) ?? [];
      existing.push(document);
      backlinksMap.set(target.id, existing);

      graphEdges.push({ source: document.id, target: target.id, type: "relatedTo" });
    }

    for (const linkedSlug of parseInternalBrainLinks(document.body)) {
      const target = slugMap.get(linkedSlug);
      if (!target) {
        continue;
      }

      linkedIds.add(target.id);
      const existing = backlinksMap.get(target.id) ?? [];
      existing.push(document);
      backlinksMap.set(target.id, existing);

      graphEdges.push({ source: document.id, target: target.id, type: "references" });
    }

    linkedIdsByDocument.set(document.id, linkedIds);

    graphEdges.push({ source: document.id, target: `category:${document.category}`, type: "belongsToCategory" });

    for (const tag of document.tags ?? []) {
      graphEdges.push({ source: document.id, target: `tag:${tag}`, type: "taggedWith" });
    }
  }

  const graphNodes: GraphNode[] = [
    ...sortedDocuments.map((document) => ({
      id: document.id,
      label: document.title,
      type: "document" as const,
      url: document.url,
    })),
    ...Array.from(categoryMap.keys()).map((category) => ({
      id: `category:${category}`,
      label: slugToTitle(category),
      type: "category" as const,
      url: `${BRAIN_BASE_PATH}/category/${category}`,
    })),
    ...Array.from(tagMap.keys()).map((tag) => ({
      id: `tag:${tag}`,
      label: tag,
      type: "tag" as const,
      url: `${BRAIN_BASE_PATH}/tag/${tag}`,
    })),
  ];

  const publicDocuments = sortedDocuments.filter((document) => isPublicIndexable(document));

  return {
    allDocuments: sortedDocuments,
    publicDocuments,
    idMap,
    categoryMap,
    tagMap,
    backlinksMap,
    linkedIdsByDocument,
    graphNodes,
    graphEdges,
  };
}

async function getCache(): Promise<CachedContent> {
  if (process.env.NODE_ENV !== "production") {
    return buildContentCache();
  }

  if (!contentCache) {
    contentCache = await buildContentCache();
  }

  return contentCache;
}

export async function refreshContentCache(): Promise<void> {
  contentCache = await buildContentCache();
}

export function getCanonicalUrl(relativePath: string): string {
  return new URL(relativePath, SITE_URL).toString();
}

export function getDefaultCategoryDescription(category: string): string {
  return CATEGORY_DESCRIPTIONS[category] ?? "Knowledge notes and documentation.";
}

export async function getAllDocuments(options?: {
  includePrivate?: boolean;
  includeNoIndex?: boolean;
}): Promise<Document[]> {
  const cache = await getCache();
  const includePrivate = options?.includePrivate ?? false;
  const includeNoIndex = options?.includeNoIndex ?? false;

  return cache.allDocuments.filter((document) => {
    if (!includePrivate && (document.visibility ?? "public") !== "public") {
      return false;
    }

    if (!includeNoIndex && document.index === false) {
      return false;
    }

    return true;
  });
}

export async function getPublicDocuments(): Promise<Document[]> {
  const cache = await getCache();
  return cache.publicDocuments;
}

export async function getDocumentBySlug(slug: string[]): Promise<Document | null> {
  const cache = await getCache();
  const slugPath = slug.join("/");
  const document = cache.allDocuments.find((entry) => entry.slugPath === slugPath);
  return document ?? null;
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const cache = await getCache();
  return cache.idMap.get(id) ?? null;
}

export async function getAllCategories(): Promise<Category[]> {
  const cache = await getCache();
  const categories = Array.from(cache.categoryMap.entries()).map(([name, documents]) => {
    const visible = documents.filter((document) => isPublicIndexable(document));

    return {
      name,
      slug: name,
      description: getDefaultCategoryDescription(name),
      count: visible.length,
      recent: visible.slice(0, 8),
      featured: visible.filter((document) => document.featured).slice(0, 6),
    };
  });

  return categories.filter((category) => category.count > 0).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAllTags(): Promise<Tag[]> {
  const cache = await getCache();

  const tags = Array.from(cache.tagMap.entries())
    .map(([name, documents]) => {
      const visibleDocuments = documents.filter((document) => isPublicIndexable(document));
      const relatedTagCounts = new Map<string, number>();

      for (const document of visibleDocuments) {
        for (const documentTag of document.tags ?? []) {
          if (documentTag === name) {
            continue;
          }

          relatedTagCounts.set(documentTag, (relatedTagCounts.get(documentTag) ?? 0) + 1);
        }
      }

      const latestDocumentAt = visibleDocuments.reduce((latest, document) => {
        const activity = getDocumentActivityTime(document);
        return activity > latest ? activity : latest;
      }, 0);

      return {
        name,
        slug: name,
        count: visibleDocuments.length,
        latestDocumentAt: new Date(latestDocumentAt).toISOString().slice(0, 10),
        relatedTags: Array.from(relatedTagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([tag]) => tag),
      };
    })
    .filter((tag) => tag.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return tags;
}

function compareTagsByPopularity(left: Tag, right: Tag): number {
  if (right.count !== left.count) {
    return right.count - left.count;
  }

  const latestDelta = new Date(right.latestDocumentAt).getTime() - new Date(left.latestDocumentAt).getTime();
  if (latestDelta !== 0) {
    return latestDelta;
  }

  return left.name.localeCompare(right.name);
}

export async function getPopularTags(limit = 24): Promise<Tag[]> {
  const tags = await getAllTags();
  return [...tags].sort(compareTagsByPopularity).slice(0, limit);
}

export async function getRelatedDocuments(document: Document, limit = 10): Promise<Document[]> {
  const cache = await getCache();

  const linkedIds = cache.linkedIdsByDocument.get(document.id) ?? new Set<string>();
  const linkedDocuments = Array.from(linkedIds)
    .map((id) => cache.idMap.get(id))
    .filter((entry): entry is Document => Boolean(entry))
    .filter((entry) => isPublicIndexable(entry));

  const byTags = cache.publicDocuments.filter((entry) => {
    if (entry.id === document.id) {
      return false;
    }

    const matchesCategory = entry.category === document.category;
    const overlapsTag = (entry.tags ?? []).some((tag) => (document.tags ?? []).includes(tag));
    return matchesCategory || overlapsTag;
  });

  const merged = new Map<string, Document>();
  for (const entry of [...linkedDocuments, ...byTags]) {
    merged.set(entry.id, entry);
  }

  return Array.from(merged.values()).slice(0, limit);
}

export async function getBacklinks(document: Document): Promise<Backlink[]> {
  const cache = await getCache();
  const backlinks = cache.backlinksMap.get(document.id) ?? [];

  return Array.from(new Map(backlinks.map((entry) => [entry.id, entry])).values())
    .filter((entry) => isPublicIndexable(entry))
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      slug: entry.slug,
      url: entry.url,
    }));
}

export async function getRecentDocuments(limit = 12): Promise<Document[]> {
  const cache = await getCache();
  return cache.publicDocuments.slice(0, limit);
}

export async function getFeaturedDocuments(limit = 8): Promise<Document[]> {
  const cache = await getCache();
  return cache.publicDocuments.filter((document) => document.featured).slice(0, limit);
}

export async function getDocumentsByCategory(category: string): Promise<Document[]> {
  const cache = await getCache();
  const normalized = normalizeCategory(category);
  const documents = cache.categoryMap.get(normalized) ?? [];
  return documents.filter((document) => isPublicIndexable(document));
}

export async function getDocumentsByTag(tag: string): Promise<Document[]> {
  const cache = await getCache();
  const normalized = normalizeTag(tag);
  const documents = cache.tagMap.get(normalized) ?? [];
  return documents.filter((document) => isPublicIndexable(document));
}

export async function generateStaticParams(): Promise<Array<{ slug: string[] }>> {
  const cache = await getCache();
  return cache.publicDocuments.map((document) => ({ slug: document.slug }));
}

export async function getAdjacentDocuments(document: Document): Promise<{ previous: Document | null; next: Document | null }> {
  const cache = await getCache();
  const sorted = [...cache.publicDocuments].sort((a, b) => a.slugPath.localeCompare(b.slugPath));
  const index = sorted.findIndex((entry) => entry.id === document.id);

  return {
    previous: index > 0 ? sorted[index - 1] : null,
    next: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null,
  };
}

export async function getKnowledgeGraph(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const cache = await getCache();
  return {
    nodes: cache.graphNodes,
    edges: cache.graphEdges,
  };
}

export async function getKnowledgeStats(): Promise<{
  totalDocuments: number;
  totalCategories: number;
  totalTags: number;
  recentlyUpdated: Document[];
}> {
  const [documents, categories, tags] = await Promise.all([
    getPublicDocuments(),
    getAllCategories(),
    getAllTags(),
  ]);

  return {
    totalDocuments: documents.length,
    totalCategories: categories.length,
    totalTags: tags.length,
    recentlyUpdated: documents.slice(0, 5),
  };
}
