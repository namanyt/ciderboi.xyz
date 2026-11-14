import type { APIRoute } from "astro";
import { site } from "../lib/content";

export const GET: APIRoute = () => {
  const origin = site.url.replace(/\/$/, "");
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    `# LLMs summary: ${origin}/llms.txt`,
    `# LLMs full context: ${origin}/llms-full.txt`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
