import { Play, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Album, Track } from "@/lib/types";

function parseDateMs(dateString: string | null | undefined): number | null {
  if (!dateString) return null;
  const ms = Date.parse(dateString);
  return Number.isFinite(ms) ? ms : null;
}

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  return `${seconds}s`;
}

function useReleaseCountdown(releaseDate: string | null | undefined) {
  const targetMs = parseDateMs(releaseDate);
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
      resolve(`rgba(${r}, ${g}, ${b}, 0.3)`);
    };

    img.onerror = () => {
      resolve("rgba(103, 58, 183, 0.3)"); // Default color
    };

    img.src = imgSrc;
  });
}

const formatDate = (releaseDate: string | null | undefined) => {
  if (!releaseDate) return "";
  const date = new Date(releaseDate);
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
              priority // Load high-priority images faster
              onLoadingComplete={(img) => {
                if (hasFetchedColor.current) return;
                hasFetchedColor.current = true;
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
            <span
              className="hover:underline cursor-pointer"
              onClick={() => window.open(url, "_blank")}
              title={songName}
            >
              {songName}
            </span>
          </h3>
          {artistDisplayList ? (
            artistDisplayList.map((artist) => (
              <p key={artist.name} className="text-white/80 text-sm truncate">
                <span
                  className="hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(artist.url, "_blank");
                  }}
                  title={artist.name}
                >
                  {artist.name}
                </span>
                {secondaryLabel ? ` • ${secondaryLabel}` : ""}
              </p>
            ))
          ) : (
            <p className="text-white/80 text-sm">Unknown Artist</p> // Fallback
          )}
          <div className="flex items-center space-x-3 mt-3">
            {isUpcoming ? (
              <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium">
                {countdownLabel || "Coming soon"}
              </span>
            ) : (
              <>
                <button
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-all flex-shrink-0 cursor-pointer" // Adjusted size, added flex-shrink-0
                  onClick={() => window.open(url, "_blank")}
                  aria-label={`Play ${songName}`}
                >
                  <Play size={16} fill="currentColor" />
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                >
                  <span className="hidden sm:inline">View on Spotify</span>
                  <span className="sm:hidden">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      width={20}
                      height={20}
                      strokeWidth={1}
                    >
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                      <path d="M8 11.973c2.5 -1.473 5.5 -.973 7.5 .527"></path>
                      <path d="M9 15c1.5 -1 4 -1 5 .5"></path>
                      <path d="M7 9c2 -1 6 -2 10 .5"></path>
                    </svg>
                  </span>
                </a>
              </>
            )}
            {/* Like / Pre-save button */}
            <button
              onClick={() => {
                if (isUpcoming) {
                  if (preSaveUrl) window.open(preSaveUrl, "_blank");
                  return;
                }
                window.open(url, "_blank");
              }}
              disabled={isUpcoming && !preSaveUrl}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-all flex-shrink-0 ${
                isUpcoming && !preSaveUrl ? "opacity-50 cursor-not-allowed hover:bg-white/20" : "cursor-pointer"
              }`}
              aria-label={
                isUpcoming
                  ? isPreSaveAvailable
                    ? `Pre-save ${songName}`
                    : `Pre-save not available yet`
                  : `Like ${songName}`
              }
              title={isUpcoming ? (isPreSaveAvailable ? "Pre-save" : "Pre-save not available yet") : "Like"}
            >
              <Heart size={16} fill="currentColor" />
            </button>
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
              priority
              onLoadingComplete={(img) => {
                if (hasFetchedColor.current) return;
                hasFetchedColor.current = true;
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
            <span className="hover:underline cursor-pointer" onClick={() => window.open(url, "_blank")}>
              {title}
            </span>
          </h3>
          {artistDisplayList ? (
            artistDisplayList.map((artist) => (
              <p key={artist.name} className="text-white/80 text-sm truncate">
                <span
                  className="hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(artist.url, "_blank");
                  }}
                  title={artist.name}
                >
                  {artist.name}
                </span>
                {secondaryLabel ? ` • ${secondaryLabel}` : ""}
              </p>
            ))
          ) : (
            <p className="text-white/80 text-sm">Unknown Artist</p> // Fallback
          )}
          <p className="text-white/80 text-sm mb-2">
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

      {/* Track list */}
      <div className="mt-6">
        <h4 className="text-white font-semibold text-lg mb-4">Tracks</h4>
        <div className="space-y-3">
          {tracks.map((track, index) => (
            <div key={track.id} className="flex items-center p-2 hover:bg-white/10 rounded-lg transition-all">
              <div className="w-6 text-white/60 mr-3 text-center">{index + 1}</div>

              <div className="flex-1">
                <p
                  className="cursor-pointer hover:underline text-white font-medium font-mono"
                  onClick={() => window.open(track.url)}
                >
                  {track.title}
                </p>
                <p className="text-white/60 text-xs">{formatDate(track.releaseDate) || ""}</p>
              </div>

              <button
                className="w-8 h-8 cursor-pointer rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white"
                onClick={() => window.open(track.url, "_blank")}
              >
                <Play size={14} fill="white" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
