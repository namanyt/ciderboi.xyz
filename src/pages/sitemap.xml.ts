import type { APIRoute } from "astro";
import { site } from "../lib/content";
import { getAllPublicRoutes } from "../lib/seo";

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = () => {
  const origin = site.url.replace(/\/$/, "");
  const urls = getAllPublicRoutes()
    .map(
      ({ path, priority }) =>
        `  <url>\n    <loc>${escapeXml(`${origin}${path}`)}</loc>\n    <priority>${priority}</priority>\n  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
