"use client";

import React from "react";
import { Props } from "@/app/music/page";
import { SongPlayerAlbum, SongPlayerTrack } from "@/components/ui/song-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationButton from "@/components/NavigationButton";

export default function Music({ data }: Props) {
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  const parseReleaseMs = (releaseDate: string | null | undefined): number | null => {
    if (!releaseDate) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(releaseDate);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
    }

    const ms = Date.parse(releaseDate);
    return Number.isFinite(ms) ? ms : null;
  };

  const shouldHideUpcoming = (releaseDate: string | null | undefined) => {
    const ms = parseReleaseMs(releaseDate);
    if (!ms) return false;
    const diff = ms - Date.now();
    return diff > ONE_WEEK_MS;
  };

  const isUpcoming = (releaseDate: string | null | undefined) => {
    const ms = parseReleaseMs(releaseDate);
    if (!ms) return false;
    return ms - Date.now() > 0;
  };

  const hasAnyItemsInFile = (catalog: Props["data"]["current"][number]) => {
    const albums = catalog.albums ?? [];
    const singles = catalog.singles ?? [];
    return albums.length > 0 || singles.length > 0;
  };

  const hasVisibleItems = (catalog: Props["data"]["current"][number]) => {
    const albums = catalog.albums ?? [];
    const singles = catalog.singles ?? [];
    return (
      albums.some((a) => !shouldHideUpcoming(a.releaseDate)) || singles.some((t) => !shouldHideUpcoming(t.releaseDate))
    );
  };

  const renderCatalog = (catalog: Props["data"]["current"][number], options?: { showArtistHeader?: boolean }) => {
    const showArtistHeader = options?.showArtistHeader ?? true;
    const albums = catalog.albums ?? [];
    const singles = catalog.singles ?? [];
    const hasAnyInFile = albums.length > 0 || singles.length > 0;
    const visibleAlbums = albums.filter((a) => !shouldHideUpcoming(a.releaseDate));
    const visibleSingles = singles.filter((t) => !shouldHideUpcoming(t.releaseDate));
    const hasAny = visibleAlbums.length > 0 || visibleSingles.length > 0;
    const hasUpcomingInFile =
      albums.some((a) => isUpcoming(a.releaseDate)) || singles.some((t) => isUpcoming(t.releaseDate));

    if (!hasAnyInFile) {
      return null;
    }

    return (
      <div key={`artist-${catalog.artist.name}`} className="space-y-4">
        {showArtistHeader ? (
          <h3
            className="text-lg sm:text-xl font-semibold"
            title={catalog.artist.name}
            onClick={() => window.open(catalog.artist.url, "_blank")}
          >
            <span className="cursor-pointer hover:underline">{catalog.artist.name}</span>
          </h3>
        ) : null}

        <div className="columns-1 sm:columns-1 md:columns-1 lg:columns-2 gap-6">
          {hasAny ? (
            <>
              {visibleAlbums.map((album, i) => (
                <div key={`album-${catalog.artist.name}-${album.id}_${i}`} className="break-inside-avoid mb-6">
                  <SongPlayerAlbum
                    title={album.title}
                    artists={album.artists?.length ? album.artists : [catalog.artist]}
                    id={album.id}
                    url={album.url}
                    releaseDate={album.releaseDate}
                    thumbnail={album.thumbnail}
                    thumbnailSize={album.thumbnailSize}
                    preSaveUrl={album.preSaveUrl}
                    tracks={album.tracks.map((t) => ({
                      ...t,
                      artists: t.artists?.length ? t.artists : album.artists?.length ? album.artists : [catalog.artist],
                    }))}
                  />
                </div>
              ))}

              {visibleSingles.map((track, i) => (
                <div key={`single-${catalog.artist.name}-${track.id}_${i}`} className="break-inside-avoid mb-6">
                  <SongPlayerTrack
                    title={track.title}
                    artists={track.artists?.length ? track.artists : [catalog.artist]}
                    id={track.id}
                    url={track.url}
                    releaseDate={track.releaseDate}
                    thumbnail={track.thumbnail}
                    thumbnailSize={track.thumbnailSize}
                    preSaveUrl={track.preSaveUrl}
                  />
                </div>
              ))}
            </>
          ) : (
            <p className="text-white/70 text-sm sm:text-base">
              {hasUpcomingInFile ? "New releases are on the way." : "No releases yet."}
            </p>
          )}
        </div>
      </div>
    );
  };

  const currentCatalogs = data.current ?? [];
  const archivedCatalogs = data.archived ?? [];

  const currentHasAnyInFile = currentCatalogs.some((c) => hasAnyItemsInFile(c));
  const archivedHasAnyInFile = archivedCatalogs.some((c) => hasAnyItemsInFile(c));

  const hasCurrent = currentCatalogs.some((c) => hasVisibleItems(c));
  const hasArchived = archivedCatalogs.some((c) => hasVisibleItems(c));

  return (
    <>
      <NavigationButton
        href={"/"}
        className="z-[60] fixed top-4 left-4 md:top-auto md:right-[1em] md:left-auto md:bottom-[1em] cursor-pointer w-auto px-6 py-2 rounded-full bg-white/30 hover:bg-white/40 transition border border-white/30 text-sm text-center shadow-md"
      >
        Back Home
      </NavigationButton>
      <div className="w-[95vw] max-w-7xl mx-auto my-6 p-4 sm:p-4 md:p-4 lg:p-8 rounded-3xl backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl text-white overflow-y-visible scroll-smooth space-y-8 sm:space-y-12">
        <h1 className="text-3xl sm:text-4xl mb-6 text-center font-semibold">Music</h1>

        <ScrollArea className="w-full max-h-none sm:h-full sm:max-h-[calc(80vh)]">
          <div className="w-full max-w-7xl space-y-6 pl-1 pr-3 sm:px-0">
            <details open className="rounded-2xl bg-white/5 border border-white/10">
              <summary className="cursor-pointer select-none px-4 sm:px-6 py-4 text-lg sm:text-xl font-semibold">
                Nitya Naman
              </summary>
              <div className="px-4 sm:px-6 pb-6 pt-2 space-y-10">
                {currentHasAnyInFile ? (
                  currentCatalogs.map((c) =>
                    renderCatalog(c, {
                      showArtistHeader: currentCatalogs.length > 1,
                    }),
                  )
                ) : (
                  <p className="text-white/70 text-sm sm:text-base">No releases yet.</p>
                )}
              </div>
            </details>

            <details open className="rounded-2xl bg-white/5 border border-white/10">
              <summary className="cursor-pointer select-none px-4 sm:px-6 py-4 text-lg sm:text-xl font-semibold">
                Cider Gamer (Archive)
              </summary>
              <div className="px-4 sm:px-6 pb-6 pt-2 space-y-10">
                {archivedHasAnyInFile ? (
                  archivedCatalogs.map((c) =>
                    renderCatalog(c, {
                      showArtistHeader: archivedCatalogs.length > 1,
                    }),
                  )
                ) : (
                  <p className="text-white/70 text-sm sm:text-base">No archived releases.</p>
                )}
              </div>
            </details>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
