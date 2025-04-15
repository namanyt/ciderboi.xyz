"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useNetwork } from "@/components/context/Network";
import { Project } from "@/lib/types";
import { ExternalLink } from "lucide-react";

export default function Home({ projects }: { projects: Project[] }) {
  const { setPage } = useNetwork();

  return (
    <div className="h-screen w-full bg-cover bg-center overflow-hidden">
      {/* Scrollable Card */}
      <div className="h-[90vh] w-[95vw] max-w-5xl mx-auto my-6 p-8 rounded-3xl backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl text-white overflow-y-auto scroll-smooth space-y-12">
        {/* Profile Section */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Image
            src="/pictures/pfp.webp"
            alt="Profile"
            width={578}
            height={542}
            className="w-32 h-32 rounded-full object-cover border-2 border-white/30 shadow-md"
          />
          <div>
            <h2 className="text-3xl font-bold">Nitya Naman</h2>
            {/*TODO: change this quote when website is complete*/}
            <p className="text-white/70 text-sm">&#34;A Dumb Bastard. Website is still WIP&#34;</p>
          </div>
        </div>

        {/* About Me Section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">About Me</h3>
          <p className="text-white/80 leading-relaxed">
            I&#39;m a curious soul who loves design, code, music, and capturing moments. Welcome to my little space on
            the web 🌸✨
          </p>
        </div>

        {/* Pinned / Quick Links Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-center">Quick Links</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setPage("/music")}
              className="w-32 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-sm text-center cursor-pointer"
            >
              🎧 Music
            </button>
            <button
              onClick={() => setPage("/photos")}
              className="w-32 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-sm text-center cursor-pointer"
            >
              📸 Photos
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Projects</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Example Project Card */}
            {projects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// const ProjectCard = ({ title, description, link }: { title: string; description: string; link: string }) => {
//   return (
//     <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
//       <h4 className="font-medium">{title}</h4>
//       <p className="text-white/70 text-sm">{description}</p>
//       <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
//         View Project
//       </a>
//     </div>
//   );
// };

function ProjectCard({ project }: { project: Project }) {
  const { id, title, description, category, tags, image, url } = project;

  const fallbackLetter = title ? title.charAt(0).toUpperCase() : "P";
  const [fallbackBgColor, setFallbackBgColor] = useState<string>("");

  useEffect(() => {
    const generatePastelColor = () => {
      const hue = Math.floor(Math.random() * 360);
      return `hsl(${hue}, 70%, 80%)`;
    };

    setFallbackBgColor(generatePastelColor());
  }, []);

  return (
    <div
      key={`${id}-${category}`}
      className="relative overflow-hidden rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 z-0"></div>
      <div className="relative z-10 flex flex-col items-center text-center p-4 space-y-3">
        {/* Image/Icon Section */}
        <div className="w-16 h-16">
          {image ? (
            <div className="relative w-full h-full">
              <Image
                src={image}
                alt={title}
                fill
                sizes="64px"
                style={{ objectFit: "contain" }}
                className="rounded-lg drop-shadow-lg shadow"
                priority
              />
            </div>
          ) : (
            <div
              className="w-full h-full rounded-lg flex items-center shadow justify-center text-white font-bold text-xl drop-shadow-lg"
              style={{ backgroundColor: fallbackBgColor }}
            >
              {fallbackLetter}
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">
              <span className="hover:underline cursor-pointer" onClick={() => window.open(url, "_blank")}>
                {title}
              </span>
            </h3>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          </div>

          <p className="text-white/80 text-sm">{description}</p>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {tags &&
              tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white"
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
