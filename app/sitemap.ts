import { MetadataRoute } from "next";
import path from "path";
import fs from "fs/promises";
import { PhotoMetadata } from "@/lib/types";

// TODO: Update this when merging with main
const BASE_URL = "https://dev.ciderboi.xyz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", priority: 1.0, changefreq: "weekly" },
    { path: "/links", priority: 0.8, changefreq: "monthly" },
    { path: "/music", priority: 0.7, changefreq: "monthly" },
    { path: "/photos", priority: 0.9, changefreq: "weekly" },
  ];

  const socialData = await fs.readFile(path.join(process.cwd(), "public", "data", "social.json"), "utf-8");
  const socials: Record<string, string> = JSON.parse(socialData);
  const socialRoutes = Object.keys(socials).map((key) => ({
    path: `/social/${key}`,
    priority: 0.5,
    changefreq: "yearly",
  }));

  const galleryData = await fs.readFile(path.join(process.cwd(), "public", "gallery", "meta.json"), "utf-8");
  const gallery: PhotoMetadata[] = JSON.parse(galleryData);
  const galleryRoutes = gallery.map((photo) => ({
    path: `/photos/${photo.uuid}`,
    priority: 0.9,
    changefreq: "yearly",
    image: `${BASE_URL}${photo.webpPath || photo.url}`, // Prefer webp if available
  }));

  const allRoutes = [...staticRoutes, ...galleryRoutes, ...socialRoutes];

  return allRoutes.map((route) => {
    const entry: MetadataRoute.Sitemap[number] = {
      url: `${BASE_URL}${route.path}`,
      lastModified: new Date().toISOString(),
      changeFrequency: route.changefreq as "yearly" | "monthly" | "weekly" | "daily" | "hourly" | "never",
      priority: route.priority,
    };

    return entry;
  });
}
