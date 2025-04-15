"use client";

import React from "react";
// No external library imports needed
import { useNetwork } from "@/components/context/Network"; // Assuming correct path
import { Props } from "@/app/music/page"; // Assuming correct path
import { SongPlayerAlbum, SongPlayerTrack } from "@/components/ui/song-card"; // Assuming correct path

export default function Music({ data }: Props) {
  const { setPage } = useNetwork();

  console.log(data);

  return (
    <div className="text-white w-full min-h-screen flex flex-col items-center py-12 px-4">
      <button
        onClick={() => setPage("/")}
        className="z-10 fixed top-4 left-4 md:top-auto md:right-[1em] md:left-auto md:bottom-[1em] cursor-pointer w-auto px-6 py-2 rounded-full bg-white/30 hover:bg-white/40 transition border border-white/30 text-sm text-center shadow-md"
      >
        Back Home
      </button>
      <h1 className="text-3xl sm:text-4xl mb-6 text-center font-semibold">Featured Music</h1>

      <div className="w-full max-w-7xl mx-auto">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-x">
          {data.albums.map((album, i) => (
            <div key={`album-${album.id}_${i}`} className="break-inside-avoid mb-6">
              {" "}
              <SongPlayerAlbum
                title={album.title}
                artists={album.artists}
                id={album.id}
                url={album.url}
                releaseDate={album.releaseDate}
                thumbnail={album.thumbnail}
                thumbnailSize={album.thumbnailSize}
                tracks={album.tracks}
              />
            </div>
          ))}

          {data.singles.map((track, i) => (
            <div key={`track-${track.id}_${i}`} className="break-inside-avoid mb-6">
              {" "}
              <SongPlayerTrack
                title={track.title}
                artists={track.artists}
                id={track.id}
                url={track.url}
                releaseDate={track.releaseDate}
                thumbnail={track.thumbnail}
                thumbnailSize={track.thumbnailSize}
              />
            </div>
          ))}
        </div>
      </div>
      {/* add vertical space */}
      <div className="h-20" />
      {/* end vertical space */}
    </div>
  );
}
