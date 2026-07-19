import { MetadataRoute } from "next";

const BASE_URL = "https://ciderboi.xyz";
const LAST_UPDATED = new Date("2026-07-19T00:00:00.000Z");

type SitemapEntry = {
  path: string;
  priority: number;
  changefreq: "yearly" | "monthly" | "weekly" | "daily" | "hourly" | "never";
  lastModified?: Date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Keep sitemap focused on canonical, indexable pages only.
  const canonicalRoutes: SitemapEntry[] = [
    { path: "", priority: 1.0, changefreq: "weekly" },
    { path: "/links", priority: 0.8, changefreq: "monthly" },
    { path: "/music", priority: 0.7, changefreq: "monthly" },
    { path: "/photos", priority: 0.9, changefreq: "weekly" },
  ];

  const uniqueRoutes = Array.from(
    new Map([...canonicalRoutes].map((route) => [route.path, route])).values(),
  );

  return uniqueRoutes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: route.lastModified ?? LAST_UPDATED,
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));
}
