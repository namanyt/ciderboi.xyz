"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Props } from "@/app/music/page";
import { SongPlayerAlbum, SongPlayerTrack } from "@/components/ui/song-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationButton from "@/components/NavigationButton";
import { parseReleaseMs, toCountdownParts } from "@/lib/release-time";

export default function Music({ data }: Props) {
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  const formatDateShort = (ms: number) => {
    try {
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(ms));
    } catch {
      return new Date(ms).toDateString();
    }
  };

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
    const dateLabel = formatDateShort(releaseMs);

    return (
      <div className="relative w-full rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-lg overflow-hidden p-4 flex flex-col gap-3">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-white/10 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-white font-semibold text-base sm:text-lg">
            {showTitle && title ? title : "Upcoming release"}
          </p>
        </div>

        <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-3 relative z-10">
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

  const hasVisibleItems = (catalog: Props["data"]["current"][number]) => {
    const albums = catalog.albums ?? [];
    const singles = catalog.singles ?? [];
    return (
      albums.some((a) => !shouldHideUpcoming(a.releaseDate)) || singles.some((t) => !shouldHideUpcoming(t.releaseDate))
    );
  };

  const getNextUpcoming = (catalog: Props["data"]["current"][number]) => {
    const albums = catalog.albums ?? [];
    const singles = catalog.singles ?? [];
    const now = Date.now();

    const candidates: Array<{ title: string; releaseDate: string; ms: number }> = [];

    for (const a of albums) {
      const ms = parseReleaseMs(a.releaseDate);
      if (ms && ms > now) candidates.push({ title: a.title, releaseDate: a.releaseDate!, ms });
    }
    for (const t of singles) {
      const ms = parseReleaseMs(t.releaseDate);
      if (ms && ms > now) candidates.push({ title: t.title, releaseDate: t.releaseDate!, ms });
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
    const hasUpcomingInFile = nextUpcoming !== null;
    const shouldShowCountdown = nextUpcoming ? shouldHideUpcoming(nextUpcoming.releaseDate) : false;

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

        {hasAny ? (
          <>
            <div className="columns-1 sm:columns-1 md:columns-1 lg:columns-2 gap-6">
              {nextUpcoming && shouldShowCountdown ? (
                <div className="break-inside-avoid mb-6">
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
            </div>
          </>
        ) : (
          <>
            {nextUpcoming && shouldShowCountdown ? (
              <div className="columns-1 sm:columns-1 md:columns-1 lg:columns-2 gap-6">
                <div className="break-inside-avoid mb-6">
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

        <ScrollArea className="w-full max-h-none sm:h-full sm:max-h-[calc(76.5vh)] overflow-auto">
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

            <details className="rounded-2xl bg-white/5 border border-white/10">
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
