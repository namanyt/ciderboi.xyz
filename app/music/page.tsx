import Music from "@/components/pages/Music";
import { notFound } from "next/navigation";
import { SongData } from "@/lib/types";
import LoadingScreen from "@/components/loading";
import { Suspense } from "react";
import fs from "fs/promises";
import path from "path";

export type Props = {
  data: SongData;
};

const fetchData = async () => {
  const file = await fs.readFile(path.join(process.cwd(), "public", "data", "songs.json"), "utf8");
  const data = JSON.parse(file) as SongData;

  return {
    props: {
      data,
    } as Props,
  };
};

export const metadata = {
  title: "Music | Nitya Naman",
  description: "The soundtrack of my life - explore my favorite albums, singles, and musical influences.",
  keywords: [
    "music",
    "Nitya Naman",
    "Cider Boi",
    "Spotify",
    "playlist",
    "albums",
    "tracks",
    "songs",
    "artist",
    "creative",
    "soundtrack",
  ],
  metadataBase: new URL("https://ciderboi.xyz"),
  alternates: {
    canonical: "https://ciderboi.xyz/music",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  openGraph: {
    title: "Music | Nitya Naman",
    description: "The soundtrack of my life - explore my favorite albums, singles, and musical influences.",
    url: "https://ciderboi.xyz/music",
    siteName: "Nitya Naman",
    images: [
      {
        url: "https://ciderboi.xyz/pictures/embed/music.png",
        width: 1200,
        height: 630,
        alt: "Music - The Soundtrack of Nitya Naman's Life",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    title: "Music | Nitya Naman",
    description: "The soundtrack of my life.",
    card: "summary_large_image",
    creator: "@ciderboi123",
    images: [
      {
        url: "https://ciderboi.xyz/pictures/embed/music.png",
        width: 1200,
        height: 630,
        alt: "Music - Nitya Naman",
      },
    ],
  },
};

export default async function MusicPage() {
  const data = await fetchData();
  if (!data.props.data) notFound();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Music data={data.props.data} />
    </Suspense>
  );
}
