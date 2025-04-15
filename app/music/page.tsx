import Music from "@/components/pages/Music";
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

export default async function MusicPage() {
  const data = await fetchData();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Music data={data.props.data} />
    </Suspense>
  );
}
