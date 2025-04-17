import { Suspense } from "react";
import Home from "@/components/pages/Home";
import fs from "fs/promises";
import path from "path";
import LoadingScreen from "@/components/loading";
import { Project, Experience, SkillGroup } from "@/lib/types";

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

export const metadata = {
  title: "Nitya Naman",
  description: "code. music. chaos.",
  keywords: [
    "Nitya Naman",
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
  ],
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
