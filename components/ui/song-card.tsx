import { Heart, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Album, Track } from "@/lib/types";
import { formatCountdown, parseReleaseMs } from "@/lib/release-time";

const DEFAULT_TINT = "rgba(103, 58, 183, 0.3)";
const dominantColorCache = new Map<string, string>();

function useReleaseCountdown(releaseDate: string | null | undefined) {
  const targetMs = parseReleaseMs(releaseDate);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!targetMs) return;
    if (targetMs <= Date.now()) return;
    const interval = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [targetMs]);

  if (!targetMs) return { isUpcoming: false, countdownLabel: "" };
  const remaining = targetMs - nowMs;
  const isUpcoming = remaining > 0;
  const countdownLabel = isUpcoming ? `Releases in ${formatCountdown(remaining)}` : "";
  return { isUpcoming, countdownLabel };
}

function extractColor(imgSrc: string): Promise<string> {
  const cachedColor = dominantColorCache.get(imgSrc);
  if (cachedColor) return Promise.resolve(cachedColor);

  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";

    const resolveAndCache = (color: string) => {
      dominantColorCache.set(imgSrc, color);
      resolve(color);
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;

      if (!imageData) {
        resolveAndCache(DEFAULT_TINT);
        return;
      }

      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < imageData.length; i += 20) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      resolveAndCache(`rgba(${r}, ${g}, ${b}, 0.3)`);
    };

    img.onerror = () => resolveAndCache(DEFAULT_TINT);
    img.src = imgSrc;
  });
}

const formatDate = (releaseDate: string | null | undefined) => {
  if (!releaseDate) return "";
  const ms = parseReleaseMs(releaseDate);
  const date = ms ? new Date(ms) : new Date(releaseDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function useArtworkTint(thumbnail: string | null | undefined) {
  const [bgColor, setBgColor] = useState(DEFAULT_TINT);
  const hasFetchedColor = useRef(false);

  useEffect(() => {
    hasFetchedColor.current = false;
  }, [thumbnail]);

  const onArtworkLoad = (img: HTMLImageElement) => {
    if (hasFetchedColor.current) return;
    hasFetchedColor.current = true;
    const src = img.currentSrc || img.src;
    extractColor(src).then((color) => setBgColor(color));
  };

  return { bgColor, onArtworkLoad };
}

export function SongPlayerTrack({ title, artists, id, url, releaseDate, thumbnail, thumbnailSize, preSaveUrl }: Track) {
  const { bgColor, onArtworkLoad } = useArtworkTint(thumbnail);
  const artistDisplayList = artists && artists.length > 0 ? artists : null;
  const formattedReleaseDate = formatDate(releaseDate);
  const { isUpcoming, countdownLabel } = useReleaseCountdown(releaseDate);
  const isPreSaveAvailable = isUpcoming && !!preSaveUrl;

  return (
    <div
      className={`relative w-full rounded-2xl ${thumbnail ? "backdrop-blur-sm" : "bg-white/10"} border border-white/20 shadow-xl overflow-hidden p-4`}
      style={thumbnail ? { backgroundColor: bgColor } : {}}
      key={id}
    >
      <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center gap-4">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg bg-white/10 border border-white/30 shadow-md flex items-center justify-center overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              width={thumbnailSize?.width || 96}
              height={thumbnailSize?.height || 96}
              className="object-cover w-full h-full"
              loading="lazy"
              onLoad={(event) => onArtworkLoad(event.currentTarget)}
            />
          ) : (
            <div className="text-white text-xs sm:text-sm font-medium text-center p-1">Album Art</div>
          )}
        </div>

        <div className="flex-1 min-w-0 w-full pl-0 min-[420px]:pl-2 md:pl-3">
          <h3 className="text-white font-bold font-mono text-base sm:text-lg truncate">
            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline" title={title}>
              {title}
            </a>
          </h3>
          {artistDisplayList ? (
            artistDisplayList.map((artist) => (
              <p key={artist.name} className="text-white/80 text-sm truncate">
                <a
                  href={artist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  title={artist.name}
                >
                  {artist.name}
                </a>
                {formattedReleaseDate ? ` • ${formattedReleaseDate}` : ""}
              </p>
            ))
          ) : (
            <p className="text-white/80 text-sm">Unknown Artist</p>
          )}

          <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3">
            {isUpcoming ? (
              <>
                <span className="inline-flex min-w-0 items-center justify-center px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium text-center break-words">
                  {countdownLabel || "Coming soon"}
                </span>
                <a
                  href={preSaveUrl || "#"}
                  target={preSaveUrl ? "_blank" : undefined}
                  rel={preSaveUrl ? "noopener noreferrer" : undefined}
                  onClick={(event) => {
                    if (!preSaveUrl) event.preventDefault();
                  }}
                  aria-disabled={!isPreSaveAvailable}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-all flex-shrink-0 ${!isPreSaveAvailable ? "opacity-50 cursor-not-allowed hover:bg-white/20" : "cursor-pointer"
                    }`}
                  aria-label={isPreSaveAvailable ? `Pre-save ${title}` : "Pre-save not available yet"}
                  title={isPreSaveAvailable ? "Pre-save" : "Pre-save not available yet"}
                >
                  <Heart size={16} fill="currentColor" />
                </a>
              </>
            ) : (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                aria-label={`Play ${title} on Spotify`}
              >
                <Play size={16} fill="currentColor" />
                <span>Play on Spotify</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SongPlayerAlbum({
  title,
  id,
  url,
  releaseDate,
  thumbnail,
  thumbnailSize,
  tracks,
  artists,
  preSaveUrl,
}: Album) {
  const { bgColor, onArtworkLoad } = useArtworkTint(thumbnail);
  const artistDisplayList = artists && artists.length > 0 ? artists : null;
  const formattedReleaseDate = formatDate(releaseDate);
  const { isUpcoming, countdownLabel } = useReleaseCountdown(releaseDate);

  return (
    <div
      className={`relative w-full rounded-2xl ${thumbnail ? "backdrop-blur-sm" : "bg-white/10"} border border-white/20 shadow-xl overflow-hidden p-4`}
      style={thumbnail ? { backgroundColor: bgColor } : {}}
      key={id}
    >
      <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-5 mb-6">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-white/10 border border-white/30 shadow-md flex items-center justify-center overflow-hidden shrink-0 mx-auto sm:mx-0">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              width={thumbnailSize?.width || 128}
              height={thumbnailSize?.height || 128}
              className="object-cover w-full h-full"
              loading="lazy"
              onLoad={(event) => onArtworkLoad(event.currentTarget)}
            />
          ) : (
            <div className="text-white text-sm font-medium">Album Art</div>
          )}
        </div>

        <div className="flex-1 min-w-0 pl-0 sm:pl-3 md:pl-4">
          <h3 className="text-white font-bold font-mono text-lg sm:text-xl break-words">
            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {title}
            </a>
          </h3>
          {artistDisplayList ? (
            artistDisplayList.map((artist) => (
              <p key={artist.name} className="text-white/80 text-sm truncate">
                <a
                  href={artist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  title={artist.name}
                >
                  {artist.name}
                </a>
                {formattedReleaseDate ? ` • ${formattedReleaseDate}` : ""}
              </p>
            ))
          ) : (
            <p className="text-white/80 text-sm">Unknown Artist</p>
          )}
          <p className="text-white/80 text-sm mb-2">
            {tracks.length} tracks{formattedReleaseDate ? ` • ${formattedReleaseDate}` : ""}
          </p>

          {isUpcoming ? (
            preSaveUrl ? (
              <a
                href={preSaveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm font-medium transition-all w-full sm:w-auto text-center"
              >
                Pre-save
              </a>
            ) : (
              <div className="inline-block mt-3 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/80 text-sm font-medium">
                {countdownLabel || "Coming soon"}
              </div>
            )
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm font-medium transition-all w-full sm:w-auto text-center"
            >
              View on Spotify
            </a>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-white font-semibold text-lg mb-4">Tracks</h4>
        <div className="space-y-3">
          {tracks.map((track, index) => (
            <div key={track.id} className="flex items-center p-2 hover:bg-white/10 rounded-lg transition-all min-w-0">
              <div className="w-6 text-white/60 mr-3 text-center">{index + 1}</div>

              <div className="flex-1 min-w-0">
                <a
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:underline text-white font-medium font-mono truncate"
                >
                  {track.title}
                </a>
                <p className="text-white/60 text-xs">{formatDate(track.releaseDate) || ""}</p>
              </div>

              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 cursor-pointer rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white"
                aria-label={`Play ${track.title}`}
              >
                <Play size={14} fill="white" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
