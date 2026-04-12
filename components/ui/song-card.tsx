import { Play, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Album, Track } from "@/lib/types";
import { formatCountdown, parseReleaseMs } from "@/lib/release-time";

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

// Function to extract dominant color from an image
function extractColor(imgSrc: string): Promise<string> {
  const cachedColor = dominantColorCache.get(imgSrc);
  if (cachedColor) {
    return Promise.resolve(cachedColor);
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Make canvas same size as image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx?.drawImage(img, 0, 0, img.width, img.height);

      // Get image data
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;

      if (!imageData) {
        resolve("rgba(103, 58, 183, 0.3)"); // Default color
        return;
      }

      // Calculate average color
      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      // Sample pixels (every 5th pixel to improve performance)
      for (let i = 0; i < imageData.length; i += 20) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }

      // Calculate averages
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      // Return RGBA with 30% opacity
      const color = `rgba(${r}, ${g}, ${b}, 0.3)`;
      dominantColorCache.set(imgSrc, color);
      resolve(color);
    };

    img.onerror = () => {
      const fallbackColor = "rgba(103, 58, 183, 0.3)";
      dominantColorCache.set(imgSrc, fallbackColor);
      resolve(fallbackColor); // Default color
    };

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

export function SongPlayerTrack({ title, artists, id, url, releaseDate, thumbnail, thumbnailSize, preSaveUrl }: Track) {
  const [bgColor, setBgColor] = useState("rgba(103, 58, 183, 0.3)"); // Default tint
  const hasFetchedColor = useRef(false);

  useEffect(() => {
    hasFetchedColor.current = false;
  }, [thumbnail]);

  // Use the robust check for artist names
  const artistDisplayList = artists && artists.length > 0 ? artists : null;
  const songName = title;
  const formattedReleaseDate = formatDate(releaseDate);
  const { isUpcoming, countdownLabel } = useReleaseCountdown(releaseDate);
  const secondaryLabel = formattedReleaseDate;
  const isPreSaveAvailable = isUpcoming && !!preSaveUrl;
  const trackActionUrl = isUpcoming ? preSaveUrl : null;
  const trackActionLabel = "Pre-save";

  return (
    <div
      // Consider adding min-h-[value] if needed for consistent card height in columns/grid
      className={`relative w-full rounded-2xl ${thumbnail ? "backdrop-blur-sm" : "bg-white/10"} border border-white/20 shadow-xl overflow-hidden p-4`}
      style={thumbnail ? { backgroundColor: bgColor } : {}}
      key={id}
    >
      <div className="flex items-center space-x-4">
        {/* Album art */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg bg-white/10 border border-white/30 shadow-md flex items-center justify-center overflow-hidden">
          {" "}
          {/* Adjusted size slightly for flexibility */}
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              width={thumbnailSize?.width || 96}
              height={thumbnailSize?.height || 96}
              className="object-cover w-full h-full" // Ensure image fills container
              loading="lazy"
              onLoad={(event) => {
                if (hasFetchedColor.current) return;
                hasFetchedColor.current = true;
                const img = event.currentTarget;
                const src = img.currentSrc || img.src;
                extractColor(src).then((color) => setBgColor(color));
              }}
            />
          ) : (
            <div className="text-white text-xs sm:text-sm font-medium text-center p-1">Album Art</div> // Adjusted text size
          )}
        </div>

        {/* Song info and controls */}
        <div className="flex-1 min-w-0">
          {" "}
          <h3 className="text-white font-bold font-mono text-base sm:text-lg truncate">
            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline" title={songName}>
              {songName}
            </a>
          </h3>
          {artistDisplayList ? (
            artistDisplayList.map((artist) => (
              <p key={artist.name} className="text-white/90 text-sm truncate">
                <a
                  href={artist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  title={artist.name}
                >
                  {artist.name}
                </a>
                {secondaryLabel ? ` • ${secondaryLabel}` : ""}
              </p>
            ))
          ) : (
            <p className="text-white/90 text-sm">Unknown Artist</p> // Fallback
          )}
          <div className="flex items-center space-x-3 mt-3">
            {isUpcoming ? (
              <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium">
                {countdownLabel || "Coming soon"}
              </span>
            ) : (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                aria-label={`Play ${songName} on Spotify`}
              >
                <Play size={16} fill="currentColor" />
                <span>Play on Spotify</span>
              </a>
            )}
            {/* Like / Pre-save button */}
            {isUpcoming ? (
              <a
                href={trackActionUrl ?? undefined}
                target={trackActionUrl ? "_blank" : undefined}
                rel={trackActionUrl ? "noopener noreferrer" : undefined}
                aria-disabled={!preSaveUrl}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-all flex-shrink-0 ${
                  !preSaveUrl ? "opacity-50 cursor-not-allowed hover:bg-white/20" : "cursor-pointer"
                }`}
                aria-label={isPreSaveAvailable ? `Pre-save ${songName}` : `Pre-save not available yet`}
                title={isPreSaveAvailable ? trackActionLabel : "Pre-save not available yet"}
                onClick={(event) => {
                  if (!trackActionUrl) {
                    event.preventDefault();
                  }
                }}
              >
                <Heart size={16} fill="currentColor" />
              </a>
            ) : null}
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
  const [bgColor, setBgColor] = useState("rgba(103, 58, 183, 0.3)"); // Default tint
  const hasFetchedColor = useRef(false);
  const artistDisplayList = artists && artists.length > 0 ? artists : null;
  const formattedReleaseDate = formatDate(releaseDate);
  const { isUpcoming, countdownLabel } = useReleaseCountdown(releaseDate);
  const secondaryLabel = formattedReleaseDate;

  useEffect(() => {
    hasFetchedColor.current = false;
  }, [thumbnail]);

  return (
    <div
      className={`relative w-full rounded-2xl ${thumbnail ? "backdrop-blur-sm" : "bg-white/10"} border border-white/20 shadow-xl overflow-hidden p-4`}
      style={thumbnail ? { backgroundColor: bgColor } : {}}
      key={id}
    >
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        {/* Album art */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-white/10 border border-white/30 shadow-md flex items-center justify-center overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              width={thumbnailSize?.width || 128}
              height={thumbnailSize?.height || 128}
              className="object-cover"
              loading="lazy"
              onLoad={(event) => {
                if (hasFetchedColor.current) return;
                hasFetchedColor.current = true;
                const img = event.currentTarget;
                const src = img.currentSrc || img.src;
                extractColor(src).then((color) => setBgColor(color));
              }}
            />
          ) : (
            <div className="text-white text-sm font-medium">Album Art</div>
          )}
        </div>

        {/* Album info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold font-mono text-xl">
            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {title}
            </a>
          </h3>
          {artistDisplayList ? (
            artistDisplayList.map((artist) => (
              <p key={artist.name} className="text-white/90 text-sm truncate">
                <a
                  href={artist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  title={artist.name}
                >
                  {artist.name}
                </a>
                {secondaryLabel ? ` • ${secondaryLabel}` : ""}
              </p>
            ))
          ) : (
            <p className="text-white/90 text-sm">Unknown Artist</p> // Fallback
          )}
          <p className="text-white/90 text-sm mb-2">
            {tracks.length} tracks{secondaryLabel ? ` • ${secondaryLabel}` : ""}
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
              <div className="inline-block mt-3 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/90 text-sm font-medium">
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

      {/* Track list */}
      <div className="mt-6">
        <h4 className="text-white font-semibold text-lg mb-4">Tracks</h4>
        <div className="space-y-3">
          {tracks.map((track, index) => (
            <div key={track.id} className="flex items-center p-2 hover:bg-white/10 rounded-lg transition-all">
              <div className="w-6 text-white/80 mr-3 text-center">{index + 1}</div>

              <div className="flex-1">
                <a
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-white font-medium font-mono"
                >
                  {track.title}
                </a>
                <p className="text-white/80 text-xs">{formatDate(track.releaseDate) || ""}</p>
              </div>

              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-white/70"
                aria-hidden="true"
              >
                <Play size={14} fill="white" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
