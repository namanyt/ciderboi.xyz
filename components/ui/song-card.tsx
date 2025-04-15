import { Play, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Album, Track } from "@/lib/types";

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

const formatDate = (releaseDate: string) => {
  const date = new Date(releaseDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function SongPlayerTrack({ title, artists, id, url, releaseDate, thumbnail, thumbnailSize }: Track) {
  const [bgColor, setBgColor] = useState("rgba(103, 58, 183, 0.3)"); // Default tint
  const hasFetchedColor = useRef(false);

  // Extract color from thumbnail
  useEffect(() => {
    if (thumbnail && !hasFetchedColor.current) {
      hasFetchedColor.current = true;
      extractColor(thumbnail).then((color) => {
        setBgColor(color);
      });
    }
  }, [thumbnail]);

  // Use the robust check for artist names
  const artistDisplayList = artists && artists.length > 0 ? artists : null;
  const songName = title.includes("-") ? title.split("-")[0].trim() : title;

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
            />
          ) : (
            <div className="text-white text-xs sm:text-sm font-medium text-center p-1">Album Art</div> // Adjusted text size
          )}
        </div>

        {/* Song info and controls */}
        <div className="flex-1 min-w-0">
          {" "}
          <h3 className="text-white font-bold text-lg truncate">
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
                </span>{" "}
                • {formatDate(releaseDate)}
              </p>
            ))
          ) : (
            <p className="text-white/80 text-sm">Unknown Artist</p> // Fallback
          )}
          <div className="flex items-center space-x-3 mt-3">
            {" "}
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
                  {" "}
                  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>{" "}
                  <path d="M8 11.973c2.5 -1.473 5.5 -.973 7.5 .527"></path> <path d="M9 15c1.5 -1 4 -1 5 .5"></path>{" "}
                  <path d="M7 9c2 -1 6 -2 10 .5"></path>{" "}
                </svg>
              </span>
            </a>
            {/* Like button */}
            <button
              onClick={() => window.open(url, "_blank")}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-all flex-shrink-0 cursor-pointer"
              aria-label={`Like ${songName}`}
            >
              <Heart size={16} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SongPlayerAlbum({ title, id, url, releaseDate, thumbnail, thumbnailSize, tracks, artists }: Album) {
  const [bgColor, setBgColor] = useState("rgba(103, 58, 183, 0.3)"); // Default tint
  const hasFetchedColor = useRef(false);
  const artistDisplayList = artists && artists.length > 0 ? artists : null;

  // Extract color from thumbnail
  useEffect(() => {
    if (thumbnail && !hasFetchedColor.current) {
      hasFetchedColor.current = true;
      extractColor(thumbnail).then((color) => {
        setBgColor(color);
      });
    }
  }, [thumbnail]);

  return (
    <div
      className={`relative w-full rounded-2xl ${thumbnail ? "backdrop-blur-sm" : "bg-white/10"} border border-white/20 shadow-xl overflow-hidden p-4`}
      style={thumbnail ? { backgroundColor: bgColor } : {}}
      key={id}
    >
      <div className="flex items-center space-x-4 mb-6">
        {/* Album art */}
        <div className="relative w-32 h-32 rounded-lg bg-white/10 border border-white/30 shadow-md flex items-center justify-center overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              width={thumbnailSize?.width || 128}
              height={thumbnailSize?.height || 128}
              className="object-cover"
              priority
            />
          ) : (
            <div className="text-white text-sm font-medium">Album Art</div>
          )}
        </div>

        {/* Album info */}
        <div className="flex-1">
          <h3 className="text-white font-bold text-xl">
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
                </span>{" "}
                • {formatDate(releaseDate)}
              </p>
            ))
          ) : (
            <p className="text-white/80 text-sm">Unknown Artist</p> // Fallback
          )}
          <p className="text-white/80 text-sm mb-2">
            {tracks.length} tracks • {formatDate(releaseDate)}
          </p>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm font-medium transition-all"
          >
            View on Spotify
          </a>
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
                  className="cursor-pointer hover:underline text-white font-medium"
                  onClick={() => window.open(track.url)}
                >
                  {track.title}
                </p>
                <p className="text-white/60 text-xs">{track.releaseDate}</p>
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
