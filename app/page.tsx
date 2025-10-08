import Home from "@/components/pages/Home";
import { Project, Experience, SkillGroup } from "@/lib/types";
import LoadingScreen from "@/components/loading";
import { Suspense } from "react";
import fs from "fs/promises";
import path from "path";
import { Metadata } from "next";

const fetchData = async () => {
  const projects = await fs.readFile(path.join(process.cwd(), "public", "data", "projects.json"), "utf8");
  const experiences = await fs.readFile(path.join(process.cwd(), "public", "data", "experiences.json"), "utf8");
  const skills = await fs.readFile(path.join(process.cwd(), "public", "data", "skills.json"), "utf8");
  return {
    projects: JSON.parse(projects).projects as Project[],
    experiences: JSON.parse(experiences).experiences as Experience[],
    skills: JSON.parse(skills).skillGroups as SkillGroup[],
  };
};

export const metadata: Metadata = {
  title: "Nitya Naman",
  description: "code. music. chaos.",
  keywords: [
    "nitya",
    "naman",
    "portfolio",
    "developer",
    "programmer",
    "software engineer",
    "web developer",
    "full stack developer",
    "react developer",
    "typescript developer",
    "Nitya Naman",
    "Cider Boi",
    "creative developer",
    "full stack developer",
    "web developer",
    "react developer",
    "typescript developer",
    "developer portfolio",
    "game developer",
    "horror game developer",
    "software engineer",
    "design engineer",
    "interactive experiences",
    "digital storyteller",
    "developer artist",
  ],
  metadataBase: new URL("https://ciderboi.xyz"),
  alternates: {
    canonical: "https://ciderboi.xyz",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Nitya Naman",
    description: "code. music. chaos.",
    url: "https://ciderboi.xyz",
    siteName: "Nitya Naman",
    images: [
      {
        url: "/pictures/embed/home.png",
        width: 1200,
        height: 630,
        alt: "Nitya Naman Portfolio Preview",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    title: "Nitya Naman",
    description: "code. music. chaos.",
    card: "summary_large_image",
    creator: "@ciderboi123",
    images: [
      {
        url: "/pictures/embed/home.png",
        width: 1200,
        height: 630,
        alt: "Nitya Naman Portfolio",
      },
    ],
  },
};

export default async function HomePage() {
  const data = await fetchData();
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Home projects={data.projects} experiences={data.experiences} skills={data.skills} />
    </Suspense>
  );
}
