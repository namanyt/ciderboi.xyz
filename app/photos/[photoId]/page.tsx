import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

type Params = {
  photoId: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  await params;
  return {
    title: "Redirecting...",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PhotoIdRedirectPage({ params }: { params: Promise<Params> }) {
  const { photoId } = await params;

  permanentRedirect(`/photos?id=${photoId}`);
}
