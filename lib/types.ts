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

export type ImageSize = {
  width?: number | null;
  height?: number | null;
};

export type Track = {
  title: string;
  artists?: Artist[];
  id: string;
  url: string;
  releaseDate: string | null;
  thumbnail?: string | null;
  thumbnailSize: ImageSize;
  preSaveUrl?: string | null;
};

export type Album = {
  title: string;
  artists?: Artist[];
  id: string;
  url: string;
  releaseDate: string;
  thumbnail?: string | null;
  thumbnailSize: ImageSize;
  tracks: Track[];
  preSaveUrl?: string | null;
};

export type ArtistCatalog = {
  artist: Artist;
  albums: Album[];
  singles: Track[];
};

export type SongData = {
  current: ArtistCatalog[];
  archived: ArtistCatalog[];
};

export type PhotoMetadata = {
  uuid: string;
  url: string;
  webpPath: string;
  blurPath: string;
  size: {
    width: number;
    height: number;
  };
  metadata: {
    make: string;
    camera: string;
    software: string;
    orientation: number;
    focalLength: string;
    aperture: string;
    iso: number;
    shutterSpeed: string;
    datetime: string;
    gps: {
      latitude: number;
      longitude: number;
    };
  };
};

export type Experience = {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  tags?: string[];
  logo?: string; // Optional company logo
};

export type SkillGroup = {
  title: string;
  skills: string[];
};
