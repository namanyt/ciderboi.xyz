import {
  getExperiences,
  getProjects,
  getReleases,
  getSkillGroups,
  site,
  type Project,
  type Release,
} from "./content";

const origin = site.url.replace(/\/$/, "");
const SITE_UPDATED_AT = "2026-11-24";

export const personId = `${origin}/#person`;
export const websiteId = `${origin}/#website`;

const OG_BY_ROUTE: Record<string, string> = {
  "/work": "/og/work.png",
  "/about": "/og/about.png",
  "/resume": "/og/resume.png",
  "/music": "/og/music.png",
  "/contact": "/og/contact.png",
};

const ARTIST_PROFILES = [
  "https://music.youtube.com/@ciderboi",
  "https://music.apple.com/in/artist/nitya-naman/1864402688",
  "https://music.amazon.in/artists/B0BSFZ4HZ7/nitya-naman",
  "https://www.jiosaavn.com/artist/nitya-naman-songs/DD9aTdU0BLE_",
];

const AWARDS = [
  "y-cruncher World Record — Gamma(1/5) to 300,000,000,000 decimal digits (2026)",
  "1st Place — GPSC Capitall, National Level (2023)",
  "3rd Place — GPSC Capax Infinitum, National Level (2024)",
  "3rd Place — All India Inter-DPS Science & Commerce Festival (2024)",
];

function cleanRoutePath(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

export function pageUrl(path: string): string {
  return new URL(cleanRoutePath(path), site.url).toString();
}

export function resolveOgPath(path: string, ogImage?: string): string {
  if (ogImage) return ogImage;
  const cleanPath = cleanRoutePath(path);
  return (
    OG_BY_ROUTE[cleanPath] ??
    (cleanPath.startsWith("/work/") ? "/og/work-project.png" : "/og/home.png")
  );
}

export function resolveOgType(path: string, ogType?: "website" | "profile"): "website" | "profile" {
  if (ogType) return ogType;
  const cleanPath = cleanRoutePath(path);
  return cleanPath === "/" || cleanPath === "/about" || cleanPath === "/resume" ? "profile" : "website";
}

function ogImageObject(path: string, ogImage?: string) {
  return {
    "@type": "ImageObject",
    url: new URL(resolveOgPath(path, ogImage), site.url).toString(),
    width: 1200,
    height: 630,
  };
}

function toIsoDate(raw: string, fallbackYear: number): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}-\d{2}$/.test(raw)) return `${raw}-01`;
  if (/^\d{4}$/.test(raw)) return `${raw}-01-01`;
  return `${fallbackYear}-01-01`;
}

function extractYoutubeId(embedUrl?: string): string | null {
  return embedUrl?.match(/embed\/([^?&/]+)/)?.[1] ?? null;
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: pageUrl("/"),
    name: `${site.name} — ciderboi.xyz`,
    alternateName: "ciderboi.xyz",
    description: site.description,
    inLanguage: "en",
    author: { "@id": personId },
    publisher: { "@id": personId },
  };
}

export function personSchema(): Record<string, unknown> {
  const skills = [...new Set(getSkillGroups().flatMap((g) => g.items))];
  const sameAs = [...new Set([...site.socials.map((s) => s.href), ...ARTIST_PROFILES])];

  return {
    "@type": "Person",
    "@id": personId,
    name: site.name,
    givenName: "Nitya",
    familyName: "Naman",
    alternateName: ["Cider Boi", site.handle, "namanyt", "nnthegamer", "Cider Gamer"],
    url: origin,
    mainEntityOfPage: pageUrl("/"),
    image: {
      "@type": "ImageObject",
      "@id": `${origin}/#avatar`,
      url: `${origin}/img/pfp.jpg`,
      contentUrl: `${origin}/img/pfp.jpg`,
      width: 480,
      height: 489,
      caption: site.name,
    },
    email: `mailto:${site.email}`,
    jobTitle: site.role,
    description: site.description,
    homeLocation: {
      "@type": "Place",
      name: site.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Haridwar",
        addressRegion: "Uttarakhand",
        addressCountry: "IN",
      },
    },
    knowsAbout: skills,
    sameAs,
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "University of Petroleum and Energy Studies",
      alternateName: "UPES",
    },
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "University of Petroleum and Energy Studies",
        alternateName: "UPES",
        location: { "@type": "Place", name: "Dehradun, India" },
      },
      {
        "@type": "EducationalOrganization",
        name: "Delhi Public School",
        location: { "@type": "Place", name: "Jaipur, India" },
      },
    ],
    award: AWARDS,
  };
}

export function breadcrumbSchema(
  path: string,
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl(path)}#breadcrumb`,
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}

export function profilePageSchema(
  path: string,
  name: string,
  description: string,
): Record<string, unknown>[] {
  const url = pageUrl(path);
  const cleanPath = cleanRoutePath(path);
  const isHome = cleanPath === "/";
  const breadcrumb = isHome
    ? null
    : breadcrumbSchema(cleanPath, [
        { name: "Home", path: "/" },
        { name: name.split(" — ")[0], path: cleanPath },
      ]);

  const page: Record<string, unknown> = {
    "@type": "ProfilePage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "en",
    isPartOf: { "@id": websiteId },
    mainEntity: { "@id": personId },
    primaryImageOfPage: ogImageObject(cleanPath),
    ...(breadcrumb ? { breadcrumb: { "@id": breadcrumb["@id"] as string } } : {}),
  };

  return breadcrumb ? [page, breadcrumb] : [page];
}

export function contactPageSchema(path: string, description: string): Record<string, unknown>[] {
  const url = pageUrl(path);
  const breadcrumb = breadcrumbSchema(path, [
    { name: "Home", path: "/" },
    { name: "Contact", path },
  ]);

  return [
    {
      "@type": "ContactPage",
      "@id": `${url}#webpage`,
      url,
      name: `Contact — ${site.name}`,
      description,
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      mainEntity: { "@id": personId },
      primaryImageOfPage: ogImageObject(path),
      breadcrumb: { "@id": breadcrumb["@id"] as string },
    },
    breadcrumb,
  ];
}

export function workCollectionSchema(projects: Project[]): Record<string, unknown>[] {
  const url = pageUrl("/work");
  const breadcrumb = breadcrumbSchema("/work", [
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
  ]);

  return [
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name: `Work — ${site.name}`,
      description: `Projects by ${site.name}`,
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      author: { "@id": personId },
      primaryImageOfPage: ogImageObject("/work"),
      breadcrumb: { "@id": breadcrumb["@id"] as string },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: projects.length,
        itemListElement: projects.map((p, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: pageUrl(`/work/${p.id}`),
          name: p.title,
        })),
      },
    },
    breadcrumb,
  ];
}

export function projectSchema(project: Project): Record<string, unknown>[] {
  const path = `/work/${project.id}`;
  const url = pageUrl(path);
  const projectId = `${url}#project`;
  const repo = project.links.find((l) => /github\.com/i.test(l.url))?.url;
  const imageUrls = project.images.length
    ? project.images.map((im) => new URL(im.src, site.url).toString())
    : project.cover
      ? [new URL(project.cover, site.url).toString()]
      : [];
  const isCodeProject = Boolean(
    repo || /Game|Graphics|Systems|Platform|Web|HPC|Tools/i.test(project.category),
  );
  const ytId = extractYoutubeId(project.video?.url);
  const firstLogDate = project.log[0]?.date;
  const uploadDate = firstLogDate ? toIsoDate(firstLogDate, project.year) : `${project.year}-01-01`;

  const breadcrumb = breadcrumbSchema(path, [
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
    { name: project.title, path },
  ]);

  const workItem: Record<string, unknown> = {
    "@type": isCodeProject ? "SoftwareSourceCode" : "CreativeWork",
    "@id": projectId,
    url,
    mainEntityOfPage: url,
    name: project.title,
    headline: project.tagline,
    description: project.detail ?? project.summary,
    datePublished: String(project.year),
    inLanguage: "en",
    author: { "@id": personId },
    creator: { "@id": personId },
    keywords: [project.category, ...project.stack],
    ...(isCodeProject ? { programmingLanguage: project.stack } : {}),
    ...(repo ? { codeRepository: repo } : {}),
    ...(imageUrls.length === 1 ? { image: imageUrls[0] } : imageUrls.length > 1 ? { image: imageUrls } : {}),
    ...(project.video
      ? {
          video: {
            "@type": "VideoObject",
            name: project.video.caption ?? project.title,
            description: project.summary,
            embedUrl: project.video.url,
            uploadDate,
            ...(ytId ? { thumbnailUrl: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` } : {}),
          },
        }
      : {}),
  };

  const pageNode: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: `${project.title} — ${site.name}`,
    description: project.summary,
    inLanguage: "en",
    isPartOf: { "@id": websiteId },
    mainEntity: { "@id": projectId },
    primaryImageOfPage: imageUrls[0] ? { "@type": "ImageObject", url: imageUrls[0] } : ogImageObject(path),
    breadcrumb: { "@id": breadcrumb["@id"] as string },
  };

  return [pageNode, breadcrumb, workItem];
}

export function musicCollectionSchema(releases: Release[]): Record<string, unknown>[] {
  const url = pageUrl("/music");
  const nonArchive = releases.filter((r) => r.kind !== "archive");
  const breadcrumb = breadcrumbSchema("/music", [
    { name: "Home", path: "/" },
    { name: "Music", path: "/music" },
  ]);

  return [
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name: `Music — ${site.name}`,
      description: `Discography and independent releases by ${site.name}.`,
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      author: { "@id": personId },
      primaryImageOfPage: ogImageObject("/music"),
      breadcrumb: { "@id": breadcrumb["@id"] as string },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: nonArchive.length,
        itemListElement: nonArchive.map((r, idx) => {
          const safeUrl = r.url ? r.url.replace(/^http:\/\//i, "https://") : undefined;
          return {
            "@type": "ListItem",
            position: idx + 1,
            item: {
              "@type": r.kind === "album" ? "MusicAlbum" : "MusicRecording",
              name: r.title,
              datePublished: r.date,
              byArtist: { "@id": personId },
              ...(safeUrl ? { url: safeUrl } : {}),
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
          };
        }),
      },
    },
    breadcrumb,
  ];
}

export function buildJsonLdGraph(extra?: Record<string, unknown> | Record<string, unknown>[]) {
  const extraItems = !extra ? [] : Array.isArray(extra) ? extra : [extra];
  return {
    "@context": "https://schema.org",
    "@graph": [personSchema(), websiteSchema(), ...extraItems],
  };
}

export type SitemapImage = {
  loc: string;
  title?: string;
  caption?: string;
};

export type SitemapRoute = {
  path: string;
  priority: string;
  lastmod: string;
  images?: SitemapImage[];
};

function latestProjectDate(project: Project): string {
  if (project.id === "gamma-1d5-300b") return SITE_UPDATED_AT;
  const dates = project.log
    .map((entry) => entry.date.match(/\d{4}(?:-\d{2})?(?:-\d{2})?/)?.[0])
    .filter((d): d is string => Boolean(d))
    .map((d) => toIsoDate(d, project.year));
  if (dates.length) return dates.sort().at(-1)!;
  return `${project.year}-01-01`;
}

export function getAllPublicRoutes(): SitemapRoute[] {
  const projects = getProjects();
  const releases = getReleases();
  const experiences = getExperiences();

  const latestReleaseDate = releases.map((r) => r.date).sort().at(-1) ?? SITE_UPDATED_AT;
  const latestExpDate =
    experiences
      .map((e) => e.end ?? e.start)
      .filter(Boolean)
      .map((d) => toIsoDate(d, 2026))
      .sort()
      .at(-1) ?? SITE_UPDATED_AT;

  return [
    {
      path: "/",
      priority: "1.0",
      lastmod: SITE_UPDATED_AT,
      images: [
        { loc: `${origin}/img/pfp.jpg`, title: site.name, caption: `${site.name} portrait` },
        { loc: `${origin}/og/home.png`, title: `${site.name} — ${site.role}` },
      ],
    },
    {
      path: "/work",
      priority: "0.9",
      lastmod: SITE_UPDATED_AT,
      images: [{ loc: `${origin}/og/work.png`, title: `Work — ${site.name}` }],
    },
    {
      path: "/about",
      priority: "0.8",
      lastmod: SITE_UPDATED_AT,
      images: [{ loc: `${origin}/img/pfp.jpg`, title: `About — ${site.name}` }],
    },
    {
      path: "/resume",
      priority: "0.8",
      lastmod: latestExpDate > SITE_UPDATED_AT ? SITE_UPDATED_AT : latestExpDate,
    },
    {
      path: "/music",
      priority: "0.7",
      lastmod: latestReleaseDate,
      images: [{ loc: `${origin}/og/music.png`, title: `Music — ${site.name}` }],
    },
    {
      path: "/contact",
      priority: "0.7",
      lastmod: SITE_UPDATED_AT,
    },
    ...projects.map((p) => ({
      path: `/work/${p.id}`,
      priority: "0.7",
      lastmod: latestProjectDate(p),
      images: p.images.map((im) => ({
        loc: new URL(im.src, site.url).toString(),
        title: p.title,
        caption: im.caption ?? im.alt,
      })),
    })),
  ];
}
