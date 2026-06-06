import { MetadataRoute } from "next";

const BASE_URL = "https://ciderboi.xyz";
const LAST_UPDATED = new Date("2026-06-06T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  // Keep sitemap focused on canonical, indexable pages only.
  const canonicalRoutes = [
    { path: "", priority: 1.0, changefreq: "weekly" },
    { path: "/links", priority: 0.8, changefreq: "monthly" },
    { path: "/music", priority: 0.7, changefreq: "monthly" },
    { path: "/photos", priority: 0.9, changefreq: "weekly" },
  ];

  return canonicalRoutes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: LAST_UPDATED,
    changeFrequency: route.changefreq as "yearly" | "monthly" | "weekly" | "daily" | "hourly" | "never",
    priority: route.priority,
  }));
}
