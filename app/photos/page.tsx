import Photo from "@/components/pages/Photo";
import { PhotoMetadata } from "@/lib/types";
import { notFound } from "next/navigation";
import LoadingScreen from "@/components/loading";
import { Suspense } from "react";
import fs from "fs/promises";
import path from "path";

export const metadata = {
  title: "Photography | Nitya Naman",
  description: "Frames from the real world - explore my photography portfolio and visual storytelling.",
  keywords: [
    "photography",
    "Nitya Naman",
    "Cider Boi",
    "photos",
    "gallery",
    "visual art",
    "photographer",
    "portfolio",
    "images",
    "creative",
    "visual storytelling",
  ],
  metadataBase: new URL("https://ciderboi.xyz"),
  alternates: {
    canonical: "https://ciderboi.xyz/photos",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  openGraph: {
    title: "Photography | Nitya Naman",
    description: "Frames from the real world - explore my photography portfolio and visual storytelling.",
    url: "https://ciderboi.xyz/photos",
    siteName: "Nitya Naman",
    images: [
      {
        url: "https://ciderboi.xyz/pictures/embed/photo.png",
        width: 1200,
        height: 630,
        alt: "Photography - Frames from the Real World by Nitya Naman",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    title: "Photography | Nitya Naman",
    description: "Frames from the real world.",
    card: "summary_large_image",
    creator: "@ciderboi123",
    images: [
      {
        url: "https://ciderboi.xyz/pictures/embed/photo.png",
        width: 1200,
        height: 630,
        alt: "Photography - Nitya Naman",
      },
    ],
  },
};

const fetchPhotos = async () => {
  return {
    props: {
      photos: JSON.parse(
        await fs.readFile(path.join(process.cwd(), "public", "gallery", "meta.json"), "utf8"),
      ) as PhotoMetadata[],
    },
  };
};

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const data = (await fetchPhotos()).props.photos;
  const id = (await searchParams).id;
  if (!data) notFound();
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Photo photos={data} photoId={id} />
    </Suspense>
  );
}
