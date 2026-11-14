import {
  getProjects,
  getSkillGroups,
  getReleases,
  site,
  type Project,
  type Release,
} from "./content";

const origin = site.url.replace(/\/$/, "");
export const personId = `${origin}/#person`;

export function personSchema(): Record<string, unknown> {
  const skills = getSkillGroups().flatMap((g) => g.items);
  return {
    "@type": "Person",
    "@id": personId,
    name: site.name,
    alternateName: ["Cider Boi", site.handle],
    url: origin,
    image: `${origin}/img/pfp.jpg`,
    email: `mailto:${site.email}`,
    jobTitle: site.role,
    description: site.description,
    homeLocation: {
      "@type": "Place",
      name: site.location,
    },
    knowsAbout: skills,
    sameAs: site.socials.map((s) => s.href),
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Petroleum and Energy Studies",
    },
  };
}

export function profilePageSchema(path: string, name: string, description: string): Record<string, unknown> {
  return {
    "@type": "ProfilePage",
    url: `${origin}${path === "/" ? "" : path}`,
    name,
    description,
    mainEntity: { "@id": personId },
  };
}

export function contactPageSchema(path: string, description: string): Record<string, unknown> {
  return {
    "@type": "ContactPage",
    url: `${origin}${path}`,
    name: `Contact — ${site.name}`,
    description,
    mainEntity: { "@id": personId },
  };
}

export function workCollectionSchema(projects: Project[]): Record<string, unknown> {
  return {
    "@type": "CollectionPage",
    url: `${origin}/work`,
    name: `Work — ${site.name}`,
    description: `Projects by ${site.name}`,
    author: { "@id": personId },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${origin}/work/${p.id}`,
        name: p.title,
      })),
    },
  };
}

export function projectSchema(project: Project): Record<string, unknown> {
  const repo = project.links.find((l) => /github\.com/i.test(l.url))?.url;
  const coverUrl = project.cover ? new URL(project.cover, origin).toString() : undefined;
  const isCodeProject = Boolean(repo || /Game|Graphics|Systems|Platform|Web|HPC/i.test(project.category));

  return {
    "@type": isCodeProject ? "SoftwareSourceCode" : "CreativeWork",
    url: `${origin}/work/${project.id}`,
    name: project.title,
    headline: project.tagline,
    description: project.summary,
    datePublished: String(project.year),
    author: { "@id": personId },
    creator: { "@id": personId },
    keywords: [project.category, ...project.stack],
    ...(isCodeProject ? { programmingLanguage: project.stack } : {}),
    ...(repo ? { codeRepository: repo } : {}),
    ...(coverUrl ? { image: coverUrl } : {}),
  };
}

export function musicCollectionSchema(releases: Release[]): Record<string, unknown> {
  const nonArchive = releases.filter((r) => r.kind !== "archive");
  return {
    "@type": "CollectionPage",
    url: `${origin}/music`,
    name: `Music — ${site.name}`,
    description: `Discography and independent releases by ${site.name}.`,
    author: { "@id": personId },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: nonArchive.length,
      itemListElement: nonArchive.map((r, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": r.kind === "album" ? "MusicAlbum" : "MusicRecording",
          name: r.title,
          datePublished: r.date,
          byArtist: { "@id": personId },
          ...(r.url ? { url: r.url } : {}),
          ...(r.cover ? { image: r.cover } : {}),
          ...(r.tracks?.length
            ? {
                numTracks: r.tracks.length,
                track: r.tracks.map((t) => ({
                  "@type": "MusicRecording",
                  position: t.n,
                  name: t.title,
                })),
              }
            : {}),
        },
      })),
    },
  };
}

export function buildJsonLdGraph(extra?: Record<string, unknown> | Record<string, unknown>[]) {
  const extraItems = !extra ? [] : Array.isArray(extra) ? extra : [extra];
  return {
    "@context": "https://schema.org",
    "@graph": [personSchema(), ...extraItems],
  };
}

export function getAllPublicRoutes() {
  const projects = getProjects();
  return [
    { path: "/", priority: "1.0" },
    { path: "/work", priority: "0.9" },
    { path: "/about", priority: "0.8" },
    { path: "/resume", priority: "0.8" },
    { path: "/music", priority: "0.7" },
    { path: "/contact", priority: "0.7" },
    ...projects.map((p) => ({ path: `/work/${p.id}`, priority: "0.7" })),
  ];
}
