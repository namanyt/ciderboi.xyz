import { redirect } from "next/navigation";

type Params = {
  photoId: string;
};

export default async function PhotoIdRedirectPage({ params }: { params: Promise<Params> }) {
  const { photoId } = await params;

  redirect(`/photos?id=${photoId}`);
}
