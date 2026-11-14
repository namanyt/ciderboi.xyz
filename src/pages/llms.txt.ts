import type { APIRoute } from "astro";
import { getProjects, site } from "../lib/content";

export const GET: APIRoute = () => {
  const origin = site.url.replace(/\/$/, "");
  const projects = getProjects();
  const featured = projects.filter((p) => p.featured);

  const lines = [
    `# ${site.name} (${site.handle})`,
    "",
    `> ${site.tagline} ${site.description} Based in ${site.location}. Contact: ${site.email}.`,
    "",
    `Full single-file Markdown dossier for AI agents: ${origin}/llms-full.txt`,
    "",
    "## Core Pages",
    `- [Home & Interactive Rack](${origin}/): Overview, selected highlights, career timeline, recent work, music, photography, and links.`,
    `- [Work Index (${projects.length} builds)](${origin}/work): Filterable portfolio covering graphics, games, HPC, systems, full-stack web, and hardware.`,
    `- [About](${origin}/about): Background, engineering philosophy, and creative interests.`,
    `- [Résumé](${origin}/resume): Structured CV, education (B.Tech CSE [GG], UPES 2025–2029), experience, and stack.`,
    `- [Music](${origin}/music): Independent instrumental and electronic discography.`,
    `- [Contact](${origin}/contact): Direct email (${site.email}) and social profiles.`,
    `- [Résumé PDF](${origin}/downloads/resume.pdf): Printable CV document.`,
    "",
    "## Featured Projects",
    ...featured.map(
      (p) => `- [${p.title}](${origin}/work/${p.id}) (${p.category}, ${p.year}): ${p.tagline}`,
    ),
    "",
    "## Other Pages & Profiles",
    ...site.socials.map((s) => `- [${s.label}](${s.href})${s.handle ? ` (${s.handle})` : ""}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
