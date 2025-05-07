"use client";

import React from "react";
import { Props } from "@/app/music/page";
import { SongPlayerAlbum, SongPlayerTrack } from "@/components/ui/song-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationButton from "@/components/NavigationButton";

export default function Music({ data }: Props) {
  return (
    <>
      <NavigationButton
        href={"/"}
        className="z-[60] fixed top-4 left-4 md:top-auto md:right-[1em] md:left-auto md:bottom-[1em] cursor-pointer w-auto px-6 py-2 rounded-full bg-white/30 hover:bg-white/40 transition border border-white/30 text-sm text-center shadow-md"
      >
        Back Home
      </NavigationButton>
      <div className="w-[95vw] max-w-5xl mx-auto my-6 p-8 rounded-3xl backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl text-white overflow-y-auto scroll-smooth space-y-12">
        <h1 className="text-3xl sm:text-4xl mb-6 text-center font-semibold">Featured Music</h1>

        <ScrollArea className="w-full h-full max-h-[calc(80vh)] overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto px-6">
            <div className="columns-1 sm:columns-1 md:columns-1 lg:columns-2 gap-6">
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
        </ScrollArea>
      </div>
    </>
  );
}
