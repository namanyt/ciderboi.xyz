// Icons for social platforms
import {
  FaGithub,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaSpotify,
  FaSoundcloud,
  FaDiscord,
  FaLinkedin,
  FaApple,
  FaAmazon,
} from "react-icons/fa";
import React, { Suspense } from "react";
import NavigationButton from "@/components/NavigationButton";
import LoadingScreen from "@/components/loading";
import fs from "fs/promises";
import path from "path";

const fetchLinks: {
  (): Promise<{ props: { links: Record<string, string>; error?: string } }>;
} = async () => {
  try {
    const file = await fs.readFile(path.join(process.cwd(), "public", "data", "social.json"), "utf8");
    const data = JSON.parse(file);

    return {
      props: {
        links: data,
      },
    };
  } catch (error) {
    console.error("Error fetching social links:", error);
    return {
      props: {
        links: {},
        error: "Failed to load social links",
      },
    };
  }
};

const iconMap = {
  github: FaGithub,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  instagram: FaInstagram,
  youtube: FaYoutube,
  spotify: FaSpotify,
  apple: FaApple,
  amazon: FaAmazon,
  soundcloud: FaSoundcloud,
  discord: FaDiscord,
};

const colorMap = {
  github: "hover:bg-gray-800 hover:text-white",
  linkedin: "hover:bg-blue-700 hover:text-white",
  twitter: "hover:bg-blue-400 hover:text-white",
  instagram: "hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 hover:text-white",
  youtube: "hover:bg-red-600 hover:text-white",
  spotify: "hover:bg-green-600 hover:text-white",
  apple: "hover:bg-[#FA233B] hover:text-white",
  amazon: "hover:bg-[#00A8E1] hover:text-white",
  soundcloud: "hover:bg-orange-500 hover:text-white",
  discord: "hover:bg-indigo-600 hover:text-white",
};

// Logical display order
const platformOrder = [
  "github",
  "linkedin",
  "twitter",
  "instagram",
  "youtube",
  "spotify",
  "apple",
  "amazon",
  "soundcloud",
  "discord",
];

const labelMap: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  twitter: "Twitter",
  instagram: "Instagram",
  youtube: "YouTube",
  spotify: "Spotify",
  apple: "Apple Music",
  amazon: "Amazon Music",
  soundcloud: "SoundCloud",
  discord: "Discord",
};

export const metadata = {
  title: "Connect With Me | Nitya Naman",
  description:
    "Find me across social platforms - GitHub, Twitter, Instagram, LinkedIn, Spotify, Apple Music, Amazon Music, YouTube, SoundCloud, and Discord.",
  metadataBase: new URL("https://ciderboi.xyz"),
  alternates: {
    canonical: "https://ciderboi.xyz/links",
  },
};

export default async function Links() {
  const { links, error } = (await fetchLinks()).props;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const sortedLinks = Object.entries(links).sort(([a], [b]) => platformOrder.indexOf(a) - platformOrder.indexOf(b));

  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative z-10 max-w-4xl w-full mx-auto">
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 shadow-xl border border-white/40">
            <h1 className="text-4xl font-bold text-center mb-2 text-gray-100">Connect With Me</h1>
            <p className="text-center text-gray-300 text-lg mb-8">Find me across the web</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sortedLinks.map(([platform]) => {
                const Icon = iconMap[platform as keyof typeof iconMap] || null;
                const hoverColor = colorMap[platform as keyof typeof colorMap] || "hover:bg-blue-500 hover:text-white";

                return (
                  <a
                    key={platform}
                    href={`/${platform}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`backdrop-blur-3xl rounded-xl p-4 flex items-center
                    transition-all duration-300 ease-in-out transform hover:scale-105
                    hover:shadow-lg border border-white/40 ${hoverColor}`}
                  >
                    {Icon && <Icon className="text-2xl mr-3 duration-300" />}
                    <span className="capitalize font-medium duration-300">{labelMap[platform] ?? platform}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <NavigationButton
          href={"/"}
          className="z-60 fixed top-4 left-4 md:top-auto md:right-[1em] md:left-auto md:bottom-[1em] cursor-pointer w-auto px-6 py-2 rounded-full bg-white/30 hover:bg-white/40 transition border border-white/30 text-sm text-center shadow-md"
        >
          Back Home
        </NavigationButton>
      </div>
    </Suspense>
  );
}
