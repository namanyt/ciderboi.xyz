import Image from "next/image";
import { backgroundImageBlurDataURL } from "@/lib/utils";

export function BackgroundPicture({ brightness, scaling = 1 }: { brightness: number; scaling?: number }) {
  return (
    <div className="fixed z-[-10] inset-0 overflow-hidden">
      <Image
        src="/pictures/background.webp"
        alt=""
        fill
        placeholder="blur"
        blurDataURL={backgroundImageBlurDataURL()}
        quality={60}
        sizes="100vw"
        style={{
          filter: `blur(8px) brightness(${brightness})`,
          transform: `scale(${scaling})`,
          objectFit: "cover",
          transition: "filter 0.5s ease-in-out, transform 0.5s ease-in-out",
        }}
        aria-hidden="true"
        priority
      />
    </div>
  );
}
