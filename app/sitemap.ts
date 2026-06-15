import { MetadataRoute } from "next";
import { getAllCategories, getAllTags, getPublicDocuments } from "@/lib/content";

const BASE_URL = "https://ciderboi.xyz";
const LAST_UPDATED = new Date("2026-06-06T00:00:00.000Z");

type SitemapEntry = {
  path: string;
  priority: number;
  changefreq: "yearly" | "monthly" | "weekly" | "daily" | "hourly" | "never";
  lastModified?: Date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [documents, categories, tags] = await Promise.all([
    getPublicDocuments(),
    getAllCategories(),
    getAllTags(),
  ]);
  const documentUrls = new Set(documents.map((document) => document.url));

  // Keep sitemap focused on canonical, indexable pages only.
  const canonicalRoutes: SitemapEntry[] = [
    { path: "", priority: 1.0, changefreq: "weekly" },
    { path: "/links", priority: 0.8, changefreq: "monthly" },
    { path: "/music", priority: 0.7, changefreq: "monthly" },
    { path: "/photos", priority: 0.9, changefreq: "weekly" },
    { path: "/brain", priority: 0.9, changefreq: "weekly" },
  ];

  const categoryRoutes: SitemapEntry[] = categories
    .map((category) => `/brain/${category.slug}`)
    .filter((path) => documentUrls.has(path))
    .map((path) => ({
      path,
      priority: 0.8,
      changefreq: "weekly" as const,
    }));

  const tagRoutes: SitemapEntry[] = tags.map((tag) => ({
    path: `/brain/tag/${tag.slug}`,
    priority: 0.7,
    changefreq: "weekly",
  }));

  const brainDocuments: SitemapEntry[] = documents.map((document) => ({
    path: document.url,
    priority: document.featured ? 0.85 : 0.7,
    changefreq: "monthly",
    lastModified: document.updated ? new Date(document.updated) : new Date(document.created),
  }));

  const uniqueRoutes = Array.from(
    new Map([...canonicalRoutes, ...categoryRoutes, ...tagRoutes, ...brainDocuments].map((route) => [route.path, route])).values(),
  );

  return uniqueRoutes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: route.lastModified ?? LAST_UPDATED,
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));
}
