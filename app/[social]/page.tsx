import { notFound, redirect } from "next/navigation";

const fetchData = async () => {
  const fs = (await import("fs/promises")).default;
  const path = (await import("path")).default;
  const file = await fs.readFile(path.join(process.cwd(), "public", "data", "social.json"), "utf-8");
  const data = JSON.parse(file) as SocialsProps;

  return {
    data,
  };
};

type SocialsProps = {
  [key: string]: string;
};

const socialMap: Record<string, string> = {
  github: "GitHub",
  twitter: "Twitter",
  instagram: "Instagram",
  youtube: "YouTube",
  spotify: "Spotify",
  soundcloud: "SoundCloud",
  discord: "Discord",
  linkedin: "LinkedIn",
};

export async function generateMetadata({ params }: { params: Promise<{ social: string }> }) {
  const social = (await params).social?.toLowerCase();

  const socialName = socialMap[social] ?? "Let's connect!";
  const safeName = Object.keys(socialMap).includes(social) ? social : "default";

  return {
    title: `${socialName} | Nitya Naman`,
    description: `Connect with me on ${socialName}`,
    openGraph: {
      images: [`pictures/og_embed/${safeName}-og.png`],
      title: `${socialName} | Nitya Naman`,
      description: `Connect with me on ${socialName}`,
      url: `https://ciderboi.xyz/${social}`,
      siteName: "Nitya Naman",
      type: "website",
      locale: "en-US",
    },
    twitter: {
      card: "summary_large_image",
      images: [`pictures/twitter_embed/${safeName}-twitter.png`],
      title: `${socialName} | Nitya Naman`,
      description: `Connect with me on ${socialName}`,
      creator: "@ciderboi123",
    },
  };
}

export default async function Socials({ params }: { params: Promise<{ social: string }> }) {
  const links = (await fetchData()).data;
  const { social } = await params;

  if (links[social.toLowerCase()]) redirect(links[social.toLowerCase()]);
  else notFound();
}
