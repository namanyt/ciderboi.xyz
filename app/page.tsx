import { Suspense } from "react";
import Home from "@/components/pages/Home";
import fs from "fs/promises";
import path from "path";
import LoadingScreen from "@/components/loading";

export type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  url: string;
};

const fetchData = async () => {
  const file = await fs.readFile(path.join(process.cwd(), "public", "data", "projects.json"), "utf8");
  return JSON.parse(file).projects as Project[];
};

export default async function HomePage() {
  const data = await fetchData();
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Home projects={data} />
    </Suspense>
  );
}
