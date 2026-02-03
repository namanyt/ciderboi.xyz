import { notFound, redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

type SocialsProps = {
  [key: string]: string;
};

const fetchData = async () => {
  const file = await fs.readFile(
    path.join(process.cwd(), "public", "data", "social.json"),
    "utf-8"
  );
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ social: string }>;
}) {
  const social = (await params).social?.toLowerCase();

  const socialName = socialMap[social] ?? "Let's connect!";
  const safeName = Object.keys(socialMap).includes(social)
    ? social
    : "default";

  return {
    title: `${socialName} | Nitya Naman`,
    description: `Connect with me on ${socialName}`,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `https://ciderboi.xyz/${social}`,
    },
    openGraph: {
      title: `${socialName} | Nitya Naman`,
      description: `Connect with me on ${socialName}`,
      url: `https://ciderboi.xyz/${social}`,
      siteName: "Nitya Naman",
      type: "website",
      locale: "en-US",
      images: [
        {
          url: `https://ciderboi.xyz/pictures/og_embed/${safeName}-og.png`,
          width: 1200,
          height: 630,
          alt: `${socialName} - Connect with Nitya Naman`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${socialName} | Nitya Naman`,
      description: `Connect with me on ${socialName}`,
      creator: "@ciderboi123",
      images: [
        {
          url: `https://ciderboi.xyz/pictures/twitter_embed/${safeName}-twitter.png`,
          width: 1200,
          height: 630,
          alt: `${socialName} - Connect with Nitya Naman`,
        },
      ],
    },
  };
}

export default async function Socials({
  params,
}: {
  params: Promise<{ social: string }>;
}) {
  const links = (await fetchData()).data;
  const { social } = await params;

  const key = social.toLowerCase();

  if (links[key]) redirect(links[key]);
  else notFound();
}
