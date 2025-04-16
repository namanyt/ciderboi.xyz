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

export default async function HomePage() {
  const data = await fetchData();
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Home projects={data.projects} experiences={data.experiences} skills={data.skills} />
    </Suspense>
  );
}
