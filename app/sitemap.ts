import { MetadataRoute } from "next";
import path from "path";
import fs from "fs";

const BASE_URL = "https://ciderboi.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", priority: 1.0, changefreq: "weekly" },
    { path: "/links", priority: 0.8, changefreq: "monthly" },
    { path: "/music", priority: 0.7, changefreq: "monthly" },
    { path: "/photos", priority: 0.9, changefreq: "weekly" },
  ];

  const socialData = fs.readFileSync(path.join(process.cwd(), "public", "data", "social.json"), "utf-8");
  const socials: Record<string, string> = JSON.parse(socialData);
  const socialRoutes = Object.keys(socials).map((key) => ({
    path: `/${key}`,
    priority: 0.5,
    changefreq: "yearly",
  }));

  const allRoutes = [...staticRoutes, ...socialRoutes];

  return allRoutes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changefreq as "yearly" | "monthly" | "weekly" | "daily" | "hourly" | "never",
    priority: route.priority,
  }));
}
