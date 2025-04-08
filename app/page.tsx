"use client";

import React from "react";

export default function Home() {
  let [brightness, setBrightness] = React.useState(0.8);

  return (
    <div>
      <BackgroundPicture brightness={brightness} />
    </div>
  );
}

function BackgroundPicture({ brightness = 0.8 }: { brightness: number }) {

  return (
    <div className="absolute inset-0 z-0">
      {/* background image */}
      <img
        src="/pictures/background.jpg"
        alt="Background"
        style={{
          filter: `blur(8px) brightness(${brightness})`,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1000, // just to be sure lol
          transition: "filter 0.5s ease-in-out",
        }}
      />

      {/* info about the image for screen reader */}
      <div
        className="sr-only"
        aria-hidden="true"
        role="img"
        aria-label="A beautiful background image"
      >
        A landscape scene of Derahdun, Haridwar, India.
        Picture taken by Nitya Naman using a Samsung Galaxy A54 phone.
      </div>

    </div>
  );
}
