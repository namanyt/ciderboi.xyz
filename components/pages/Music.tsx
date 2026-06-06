"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Props } from "@/app/music/page";
import { SongPlayerAlbum, SongPlayerTrack } from "@/components/ui/song-card";
import NavigationButton from "@/components/NavigationButton";
import { parseReleaseMs, toCountdownParts } from "@/lib/release-time";

export default function Music({ data }: Props) {
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  function ReleaseCountdownCard({
    releaseMs,
    title,
    showTitle,
  }: {
    releaseMs: number;
    title?: string;
    showTitle: boolean;
  }) {
    const [nowMs, setNowMs] = useState(() => Date.now());

    useEffect(() => {
      const id = window.setInterval(() => setNowMs(Date.now()), 1000);
      return () => window.clearInterval(id);
    }, []);

    const parts = useMemo(() => toCountdownParts(releaseMs, nowMs), [releaseMs, nowMs]);

    return (
      <div className="relative w-full rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-lg overflow-hidden p-3 sm:p-4 flex flex-col gap-3">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-white/10 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-white font-semibold text-base sm:text-lg">
            {showTitle && title ? title : "Upcoming release"}
          </p>
        </div>

        <div className="grid grid-cols-2 min-[420px]:flex min-[420px]:flex-wrap items-center justify-center gap-2 sm:gap-3 relative z-10">
          <div className="rounded-xl bg-black/20 border border-white/10 ring-1 ring-white/10 shadow-inner shadow-black/80 backdrop-blur-sm px-3 py-2 text-center min-w-[4.25rem] flex flex-col items-center justify-center">
            <div className="text-white font-semibold text-lg leading-none">{parts.days}</div>
            <div className="text-white/70 text-[10px] tracking-wide uppercase mt-1">Days</div>
          </div>
          <div className="rounded-xl bg-black/20 border border-white/10 ring-1 ring-white/10 shadow-inner shadow-black/80 backdrop-blur-sm px-3 py-2 text-center min-w-[4.25rem] flex flex-col items-center justify-center">
            <div className="text-white font-semibold text-lg leading-none">{parts.hours}</div>
            <div className="text-white/70 text-[10px] tracking-wide uppercase mt-1">Hours</div>
          </div>
          <div className="rounded-xl bg-black/20 border border-white/10 ring-1 ring-white/10 shadow-inner shadow-black/80 backdrop-blur-sm px-3 py-2 text-center min-w-[4.25rem] flex flex-col items-center justify-center">
            <div className="text-white font-semibold text-lg leading-none">{parts.minutes}</div>
            <div className="text-white/70 text-[10px] tracking-wide uppercase mt-1">Min</div>
          </div>
          <div className="rounded-xl bg-black/20 border border-white/10 ring-1 ring-white/10 shadow-inner shadow-black/80 backdrop-blur-sm px-3 py-2 text-center min-w-[4.25rem] flex flex-col items-center justify-center">
            <div className="text-white font-semibold text-lg leading-none">{parts.seconds}</div>
            <div className="text-white/70 text-[10px] tracking-wide uppercase mt-1">Sec</div>
          </div>
        </div>
      </div>
    );
  }

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

  const getNextUpcoming = (catalog: Props["data"]["current"][number]) => {
    const albums = catalog.albums ?? [];
    const singles = catalog.singles ?? [];
    const now = Date.now();

    const candidates: Array<{ title: string; releaseDate: string; ms: number }> = [];

    for (const a of albums) {
      const ms = parseReleaseMs(a.releaseDate);
      if (ms && ms > now && a.releaseDate) candidates.push({ title: a.title, releaseDate: a.releaseDate, ms });
    }
    for (const t of singles) {
      const ms = parseReleaseMs(t.releaseDate);
      if (ms && ms > now && t.releaseDate) candidates.push({ title: t.title, releaseDate: t.releaseDate, ms });
    }

    candidates.sort((x, y) => x.ms - y.ms);
    return candidates[0] ?? null;
  };

  const renderCatalog = (catalog: Props["data"]["current"][number], options?: { showArtistHeader?: boolean }) => {
    const showArtistHeader = options?.showArtistHeader ?? true;
    const albums = catalog.albums ?? [];
    const singles = catalog.singles ?? [];
    const hasAnyInFile = albums.length > 0 || singles.length > 0;
    const nextUpcoming = getNextUpcoming(catalog);
    const nextUpcomingMs = nextUpcoming?.ms ?? null;

    const isActiveUpcomingMs = (ms: number | null) => ms !== null && nextUpcomingMs !== null && ms === nextUpcomingMs;

    const visibleAlbums = albums.filter((a) => {
      const ms = parseReleaseMs(a.releaseDate);
      if (!ms) return true;
      if (!isUpcoming(a.releaseDate)) return true;
      if (!isActiveUpcomingMs(ms)) return false;
      return !shouldHideUpcoming(a.releaseDate);
    });
    const visibleSingles = singles.filter((t) => {
      const ms = parseReleaseMs(t.releaseDate);
      if (!ms) return true;
      if (!isUpcoming(t.releaseDate)) return true;
      if (!isActiveUpcomingMs(ms)) return false;
      return !shouldHideUpcoming(t.releaseDate);
    });

    const hasAny = visibleAlbums.length > 0 || visibleSingles.length > 0;
    const shouldShowCountdown = nextUpcoming ? shouldHideUpcoming(nextUpcoming.releaseDate) : false;

    if (!hasAnyInFile) {
      return null;
    }

    return (
      <div key={`artist-${catalog.artist.name}`} className="space-y-4">
        {showArtistHeader ? (
          <h2 className="text-lg sm:text-xl font-semibold" title={catalog.artist.name}>
            <a href={catalog.artist.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {catalog.artist.name}
            </a>
          </h2>
        ) : null}

        {hasAny ? (
          <>
            <div className="columns-1 sm:columns-1 md:columns-1 lg:columns-2 gap-6">
              {nextUpcoming && shouldShowCountdown ? (
                <div key={`countdown-${catalog.artist.name}-${nextUpcoming.title}`} className="break-inside-avoid mb-6">
                  <ReleaseCountdownCard releaseMs={nextUpcoming.ms} title={nextUpcoming.title} showTitle={false} />
                </div>
              ) : null}

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
                      artists: t.artists?.length
                        ? t.artists
                        : album.artists?.length
                          ? album.artists
                          : [catalog.artist],
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
            </div>
          </>
        ) : (
          <>
            {nextUpcoming && shouldShowCountdown ? (
              <div className="columns-1 sm:columns-1 md:columns-1 lg:columns-2 gap-6">
                <div key={`countdown-only-${catalog.artist.name}-${nextUpcoming.title}`} className="break-inside-avoid mb-6">
                  <ReleaseCountdownCard releaseMs={nextUpcoming.ms} title={nextUpcoming.title} showTitle={false} />
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    );
  };

  const currentCatalogs = data.current ?? [];
  const archivedCatalogs = data.archived ?? [];

  const currentHasAnyInFile = currentCatalogs.some((c) => hasAnyItemsInFile(c));
  const archivedHasAnyInFile = archivedCatalogs.some((c) => hasAnyItemsInFile(c));
  const showCurrentArtistHeaders = currentCatalogs.length > 1;
  const showArchivedArtistHeaders = archivedCatalogs.length > 1;

  return (
    <>
      <NavigationButton
        href={"/"}
        className="z-[60] fixed top-3 left-3 md:top-auto md:right-[1em] md:left-auto md:bottom-[1em] cursor-pointer w-auto px-4 sm:px-6 py-2 rounded-full bg-white/30 hover:bg-white/40 transition border border-white/30 text-sm text-center shadow-md"
      >
        Back Home
      </NavigationButton>
      <div className="h-dvh w-full md:w-[95vw] max-w-7xl mx-auto mt-0 mb-0 md:my-6 px-3 pt-16 pb-24 md:p-4 lg:p-8 rounded-none md:rounded-3xl backdrop-blur-none md:backdrop-blur-md bg-transparent md:bg-black/30 border-0 md:border md:border-white/10 shadow-none md:shadow-2xl text-white max-h-none md:max-h-[90dvh] overflow-hidden flex flex-col">
        <h1 className="text-2xl sm:text-4xl mb-4 sm:mb-6 text-center font-semibold shrink-0 px-0 md:px-0">Music</h1>

        <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth pr-0 md:pr-3">
          <div className="w-full max-w-7xl min-w-0 space-y-6 px-0 md:px-0">
            <section aria-labelledby="music-current-heading">
              <details open className="rounded-2xl bg-white/5 border border-white/10">
                <summary
                  id="music-current-heading"
                  className="cursor-pointer select-none px-4 sm:px-6 py-4 text-lg sm:text-xl font-semibold"
                >
                  Nitya Naman
                </summary>
                <div className="px-4 sm:px-6 pb-6 pt-2 space-y-10">
                  {!showCurrentArtistHeaders ? <h2 className="sr-only">Nitya Naman releases</h2> : null}
                  {currentHasAnyInFile ? (
                    currentCatalogs.map((c) =>
                      renderCatalog(c, {
                        showArtistHeader: showCurrentArtistHeaders,
                      }),
                    )
                  ) : (
                    <p className="text-white/80 text-sm sm:text-base">No releases yet.</p>
                  )}
                </div>
              </details>
            </section>

            <section aria-labelledby="music-archive-heading">
              <details className="rounded-2xl bg-white/5 border border-white/10">
                <summary
                  id="music-archive-heading"
                  className="cursor-pointer select-none px-4 sm:px-6 py-4 text-lg sm:text-xl font-semibold"
                >
                  Cider Gamer (Archive)
                </summary>
                <div className="px-4 sm:px-6 pb-6 pt-2 space-y-10">
                  {!showArchivedArtistHeaders ? <h2 className="sr-only">Cider Gamer archived releases</h2> : null}
                  {archivedHasAnyInFile ? (
                    archivedCatalogs.map((c) =>
                      renderCatalog(c, {
                        showArtistHeader: showArchivedArtistHeaders,
                      }),
                    )
                  ) : (
                    <p className="text-white/80 text-sm sm:text-base">No archived releases.</p>
                  )}
                </div>
              </details>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
