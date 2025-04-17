import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import path from "path";

const fetchData = async () => {
  const file = await fs.readFile(path.join(process.cwd(), "public", "data", "social.json"), "utf-8");
  const data = JSON.parse(file) as SocialsProps;

  return {
    data,
  };
};

type SocialsProps = {
  [key: string]: string;
};

export default async function Socials({ params }: { params: Promise<{ social: string }> }) {
  const links = (await fetchData()).data;
  const { social } = await params;

  if (links[social.toLowerCase()]) redirect(links[social.toLowerCase()]);
  else notFound();
}
