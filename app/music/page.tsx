import Music from "@/components/pages/Music";

import { Album, Track } from "@/components/ui/song-card";

export type SongData = {
  albums: Album[];
  singles: Track[];
};

export type Props = {
  data: SongData;
};

// server side query the songs from /data/songs.json
const fetchData = async () => {
  // file is at /public/data/songs.json
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
  const res = await fetch(`${baseUrl}/data/songs.json`);
  const data = await res.json();

  return {
    props: {
      data,
    } as Props,
  };
};

export default async function MusicPage() {
  const data = await fetchData();

  return <Music data={data.props.data} />;
}
