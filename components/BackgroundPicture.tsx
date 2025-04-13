import Image from "next/image";
import { backgroundImageBlurDataURL } from "@/lib/utils";

export function BackgroundPicture({ brightness = 0.8, scaling = 1 }: { brightness: number; scaling?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="/pictures/background.webp"
        alt="Background"
        fill
        placeholder="blur"
        blurDataURL={backgroundImageBlurDataURL()}
        quality={60}
        sizes="100vw"
        style={{
          filter: `blur(8px) brightness(${brightness})`,
          transform: `scale(${scaling})`,
          objectFit: "cover",
          zIndex: -1,
          transition: "filter 0.5s ease-in-out, transform 0.5s ease-in-out",
        }}
        priority
      />

      <div className="sr-only" aria-hidden="true" role="img" aria-label="A beautiful background image">
        A landscape scene of Derahdun, Haridwar, India. Picture taken by Nitya Naman using a Samsung Galaxy A54 phone.
      </div>
    </div>
  );
}
