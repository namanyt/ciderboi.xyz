export type Visibility = "public" | "private";

export interface DocumentMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  documentType?: string;
  purpose?: string;
  version?: string;
  downloadPath?: string;
  downloadLabel?: string;
  archiveLinks?: Array<{
    title: string;
    href: string;
  }>;
  created: string;
  updated?: string;
  status?: string;
  visibility?: Visibility;
  index?: boolean;
  featured?: boolean;
  tags?: string[];
  related?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  featuredImage?: string;
}

export interface Document extends DocumentMetadata {
  slug: string[];
  slugPath: string;
  url: string;
  body: string;
  plainText: string;
  headings: string[];
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  count: number;
  recent: Document[];
  featured: Document[];
}

export interface Tag {
  name: string;
  slug: string;
  count: number;
  relatedTags: string[];
}

export interface Backlink {
  id: string;
  title: string;
  slug: string[];
  url: string;
}

export interface SearchIndexEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  slug: string;
  url: string;
  headings: string[];
  content: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "document" | "category" | "tag";
  url?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "belongsToCategory" | "taggedWith" | "relatedTo" | "references";
}
