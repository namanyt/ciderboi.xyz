export type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  url: string;
};

export type Artist = {
  name: string;
  url: string;
};

export type Track = {
  title: string;
  artists: Artist[];
  id: string;
  url: string;
  releaseDate: string;
  thumbnail?: string;
  thumbnailSize: { width?: number; height?: number };
};

export type Album = {
  title: string;
  artists: Artist[];
  id: string;
  url: string;
  releaseDate: string;
  thumbnail?: string;
  thumbnailSize: { width?: number; height?: number };
  tracks: Track[];
};

export type SongData = {
  albums: Album[];
  singles: Track[];
};
