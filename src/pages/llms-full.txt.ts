import type { APIRoute } from "astro";
import {
  formatMonthYear,
  getExperiences,
  getProjects,
  getReleases,
  getSkillGroups,
  site,
} from "../lib/content";

export const GET: APIRoute = () => {
  const origin = site.url.replace(/\/$/, "");
  const experiences = getExperiences();
  const skillGroups = getSkillGroups();
  const projects = getProjects();
  const releases = getReleases();
  const mainReleases = releases.filter((r) => r.kind !== "archive").reverse();
  const archiveReleases = releases.filter((r) => r.kind === "archive");

  const lines: string[] = [
    `# ${site.name} (@${site.handle}) — Full Portfolio Context`,
    "",
    `> ${site.tagline}`,
    "",
    `- **URL:** ${origin}`,
    `- **Role:** ${site.role}`,
    `- **Location:** ${site.location}`,
    `- **Email:** ${site.email}`,
    `- **Summary:** ${site.description}`,
    "",
    "## Education",
    "- **B.Tech, Computer Science & Engineering (Graphics & Gaming)** — University of Petroleum and Energy Studies (UPES), Dehradun (2025 – 2029 · CGPA 8.49)",
    "",
    "## Experience",
    ...experiences.flatMap((e) => [
      `### ${e.title} · ${e.company}`,
      `- **Period:** ${formatMonthYear(e.start)} – ${e.end ? formatMonthYear(e.end) : "Present"}`,
      `- **Location:** ${e.location}`,
      `- **Summary:** ${e.summary}`,
      ...(e.stack?.length ? [`- **Stack:** ${e.stack.join(", ")}`] : []),
      "",
    ]),
    "## Technical Stack",
    ...skillGroups.map((g) => `- **${g.title}:** ${g.items.join(", ")}`),
    "",
    `## Projects (${projects.length})`,
    ...projects.flatMap((p) => [
      `### ${p.title} (${p.year} · ${p.category} · ${p.status})`,
      `- **Canonical URL:** ${origin}/work/${p.id}`,
      `- **Tagline:** ${p.tagline}`,
      `- **Summary:** ${p.summary}`,
      ...(p.detail ? [`- **Details:** ${p.detail}`] : []),
      `- **Stack:** ${p.stack.join(", ")}`,
      ...(p.metrics?.length
        ? [`- **Metrics:** ${p.metrics.map((m) => `${m.label}: ${m.value}`).join(" | ")}`]
        : []),
      ...(p.links.length
        ? [`- **Links:** ${p.links.map((l) => `${l.label} (${l.url})`).join(", ")}`]
        : []),
      ...(p.log.length
        ? p.log.map((entry) => `  - [${entry.date}] ${entry.text}`)
        : []),
      "",
    ]),
    "## Music Discography",
    ...mainReleases.flatMap((r) => [
      `- **${r.title}** (${r.kind}, ${r.date})${r.url ? ` — ${r.url}` : ""}`,
      ...(r.tracks?.length
        ? r.tracks.map((t) => `  ${String(t.n).padStart(2, "0")}. ${t.title}`)
        : []),
    ]),
    ...(archiveReleases.length
      ? [
          "",
          "### Cider Gamer Archive",
          ...archiveReleases.map(
            (r) => `- ${r.title} (${r.date})${r.url ? ` — ${r.url}` : ""}`,
          ),
        ]
      : []),
    "",
    "## Socials & Uplinks",
    ...site.socials.map((s) => `- **${s.label}:** ${s.href}${s.handle ? ` (${s.handle})` : ""}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
