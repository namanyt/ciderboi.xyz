import siteData from "../content/site.json";
import projectsData from "../content/projects.json";
import experiencesData from "../content/experiences.json";
import skillsData from "../content/skills.json";
import songsData from "../content/songs.json";

export type Social = { label: string; href: string; handle?: string };
export type NavItem = { label: string; href: string };

export type Site = {
  name: string;
  handle: string;
  tagline: string;
  role: string;
  location: string;
  email: string;
  description: string;
  url: string;
  socials: Social[];
  nav: NavItem[];
  redirects: Record<string, string>;
};

export type Link = { label: string; url: string };
export type LogEntry = { date: string; text: string };
export type ProjectImage = { src: string; alt: string; caption?: string; wide?: boolean };
export type Metric = { value: string; label: string };

export type ProjectVideo = { url: string; caption?: string };

export type Project = {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  detail?: string;
  category: string;
  year: number;
  status: "ongoing" | "completed" | "archived";
  featured: boolean;
  order: number;
  stack: string[];
  links: Link[];
  cover: string | null;
  video?: ProjectVideo;
  images: ProjectImage[];
  metrics?: Metric[];
  log: LogEntry[];
};

export type Experience = {
  title: string;
  company: string;
  location: string;
  start: string;
  end: string | null;
  summary: string;
  stack: string[];
};

export type SkillGroup = { title: string; items: string[] };
export type Track = { n: number; title: string };

export type Release = {
  title: string;
  kind: "single" | "album" | "archive";
  date: string;
  cover: string;
  url: string;
  preSave: string;
  tracks?: Track[];
};

export const site = siteData as Site;

const projects = [...(projectsData.projects as Project[])].sort((a, b) => a.order - b.order);
const experiences = [...(experiencesData.experiences as Experience[])].sort((a, b) =>
  b.start.localeCompare(a.start),
);
const releases = [...(songsData.releases as Release[])].sort((a, b) => a.date.localeCompare(b.date));

export const getProjects = () => projects;
export const getFeaturedProjects = (limit = 5) => projects.filter((p) => p.featured).slice(0, limit);
export const getProject = (id: string) => projects.find((p) => p.id === id);
export const getExperiences = () => experiences;
export const getSkillGroups = () => skillsData.groups as SkillGroup[];
export const getReleases = () => releases;

export const formatMonthYear = (iso: string) => {
  const [y, m] = iso.split("-");
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const mi = Number(m) - 1;
  return months[mi] ? `${months[mi].slice(0, 3)} ${y}` : y;
};

export const formatDate = (iso: string) => {
  const [y, m] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mi = Number(m) - 1;
  return months[mi] ? `${months[mi]} ${y}` : y;
};
const GROUPS: { title: string; categories: string[] }[] = [
  { title: "Graphics & Systems", categories: ["Graphics", "Creative", "Systems", "HPC", "Tools"] },
  { title: "Web", categories: ["Full-Stack", "Web"] },
  { title: "Hardware & Infrastructure", categories: ["Hardware", "Infrastructure"] },
  { title: "Games", categories: ["Game Dev"] },
];

/** Projects bucketed into a few editorial groups, original order preserved. */
export function getProjectGroups(): { title: string; projects: Project[] }[] {
  const used = new Set<string>();

  const groups = GROUPS.map((g) => {
    const items = projects
      .filter((p) => g.categories.includes(p.category) && !used.has(p.id))
      .sort((a, b) => b.year - a.year || a.order - b.order);
    items.forEach((p) => used.add(p.id));
    return { title: g.title, projects: items };
  }).filter((g) => g.projects.length > 0);

  const rest = projects.filter((p) => !used.has(p.id));
  if (rest.length) groups.push({ title: "Other", projects: rest });

  return groups;
}
