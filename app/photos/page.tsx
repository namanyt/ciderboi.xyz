import Photo from "@/components/pages/Photo";
import fs from "fs/promises";
import path from "path";
import { PhotoMetadata } from "@/lib/types";

export const metadata = {
  title: "Photos",
  description: "My photo collection",
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

export default async function PhotosPage() {
  return <Photo photos={(await fetchPhotos()).props.photos} />;
}
