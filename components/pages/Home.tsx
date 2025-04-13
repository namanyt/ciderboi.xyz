"use client";

import React from "react";
import Image from "next/image";
import { useScroll } from "@/components/context/Scroll";
import PageTransition from "@/components/PageTransition";

export default function Home() {
  const { scrollToPage } = useScroll();

  return (
    <PageTransition className="h-screen w-full bg-cover bg-center overflow-hidden">
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
              onClick={() => scrollToPage("/music")}
              className="w-32 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-sm text-center cursor-pointer"
            >
              🎧 Music
            </button>
            <button
              onClick={() => scrollToPage("/photos")}
              className="w-32 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-sm text-center cursor-pointer"
            >
              📸 Photos
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Projects</h3>
          <div className="space-y-4">
            {/* Example Project Card */}
            {projects.map((project, index) => (
              <ProjectCard key={index} title={project.title} description={project.description} link={project.link} />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

const ProjectCard = ({ title, description, link }: { title: string; description: string; link: string }) => {
  return (
    <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
      <h4 className="font-medium">{title}</h4>
      <p className="text-white/70 text-sm">{description}</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
        View Project
      </a>
    </div>
  );
};

// TODO: Add Actual Projects here
const projects = [
  {
    title: "🌐 Portfolio Website",
    description: "My personal website built with React and TailwindCSS.",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    title: "📱 Music Player App",
    description: "A beautiful music app built using Flutter and Spotify API.",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  // Add more projects as needed
];
