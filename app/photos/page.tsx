import Photo from "@/components/pages/Photo";
import fs from "fs/promises";
import path from "path";
import { PhotoMetadata } from "@/lib/types";
import { notFound } from "next/navigation";
import LoadingScreen from "@/components/loading";
import { Suspense } from "react";

export const metadata = {
  title: "Photography",
  description: "Frames from the real world.",
  openGraph: {
    title: "Photography",
    description: "Frames from the real world.",
    url: "https://ciderboi.xyz/photos",
    siteName: "Nitya Naman",
    images: [
      {
        url: "/pictures/embed/photo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    title: "Photography",
    description: "Frames from the real world.",
    card: "summary_large_image",
    creator: "@ciderboi123",
    images: [
      {
        url: "/pictures/embed/photo.png",
        width: 1200,
        height: 630,
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
