import type { APIRoute } from "astro";
import { pageUrl, getAllPublicRoutes } from "../lib/seo";

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = () => {
  const urls = getAllPublicRoutes()
    .map(({ path, priority, lastmod, images }) => {
      const imageXml = (images ?? [])
        .map(
          (im) =>
            `    <image:image>\n      <image:loc>${escapeXml(im.loc)}</image:loc>${
              im.title ? `\n      <image:title>${escapeXml(im.title)}</image:title>` : ""
            }${im.caption ? `\n      <image:caption>${escapeXml(im.caption)}</image:caption>` : ""}\n    </image:image>`,
        )
        .join("\n");

      return `  <url>\n    <loc>${escapeXml(pageUrl(path))}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n    <priority>${priority}</priority>${
        imageXml ? `\n${imageXml}` : ""
      }\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
