import { notFound, permanentRedirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import type { Metadata } from "next";

type SocialsProps = {
  [key: string]: string;
};

const fetchData = async () => {
  const file = await fs.readFile(path.join(process.cwd(), "public", "data", "social.json"), "utf-8");
  const data = JSON.parse(file) as SocialsProps;

  return { data };
};

const socialMap: Record<string, string> = {
  github: "GitHub",
  twitter: "Twitter",
  instagram: "Instagram",
  youtube: "YouTube",
  spotify: "Spotify",
  apple: "Apple Music",
  amazon: "Amazon Music",
  soundcloud: "SoundCloud",
  discord: "Discord",
  linkedin: "LinkedIn",
};

export async function generateMetadata({ params }: { params: Promise<{ social: string }> }): Promise<Metadata> {
  const social = (await params).social?.toLowerCase();

  const socialName = socialMap[social] ?? "Let's connect!";

  return {
    title: `Redirecting to ${socialName} | Nitya Naman`,
    description: `Connect with me on ${socialName}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function Socials({ params }: { params: Promise<{ social: string }> }) {
  const links = (await fetchData()).data;
  const { social } = await params;

  const key = social.toLowerCase();

  if (links[key]) permanentRedirect(links[key]);
  else notFound();
}
