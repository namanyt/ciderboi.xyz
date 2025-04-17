import Music from "@/components/pages/Music";
import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import { Suspense } from "react";
import LoadingScreen from "@/components/loading";
import { SongData } from "@/lib/types";

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
  title: "Music",
  description: "The soundtrack of my life.",
  openGraph: {
    title: "Music",
    description: "The soundtrack of my life.",
    url: "https://ciderboi.xyz/music",
    siteName: "Nitya Naman",
    images: [
      {
        url: "/pictures/embed/music.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    title: "Music",
    description: "The soundtrack of my life.",
    card: "summary_large_image",
    creator: "@ciderboi123",
    images: [
      {
        url: "/pictures/embed/music.png",
        width: 1200,
        height: 630,
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
