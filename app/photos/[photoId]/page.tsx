import type { Metadata } from "next";
import { redirect } from "next/navigation";

type Params = {
  photoId: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { photoId } = await params;
  return {
    title: "Redirecting...",
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `https://ciderboi.xyz/photos/${photoId}`,
    },
  };
}

export default async function PhotoIdRedirectPage({ params }: { params: Promise<Params> }) {
  const { photoId } = await params;

  redirect(`/photos?id=${photoId}`);
}
