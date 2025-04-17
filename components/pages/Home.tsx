"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useNetwork } from "@/components/context/Network";
import { Project, Experience, SkillGroup } from "@/lib/types";
import { ExternalLink } from "lucide-react";

export default function Home({
  projects,
  skills,
  experiences,
}: {
  projects: Project[];
  experiences: Experience[];
  skills: SkillGroup[];
}) {
  const { setPage } = useNetwork();

  return (
    <div className="h-screen w-full bg-cover bg-center overflow-hidden">
      {/* Scrollable Card */}
      <div className="h-[90vh] w-[95vw] max-w-5xl mx-auto my-6 p-8 rounded-3xl backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl text-white overflow-y-auto scroll-smooth space-y-12">
        {/* Profile Section */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Image
            // src="/pictures/pfp.webp"
            src="/pictures/pfp-2.webp" // TODO: Update This PFP when Pushing to PROD
            alt="Profile"
            width={1288}
            height={1285}
            className="w-32 h-32 rounded-full object-cover border-2 border-white/30 shadow-md"
          />
          <div>
            <h2 className="text-3xl font-bold">Nitya Naman</h2>
            {/*TODO: change this quote when website is complete*/}
            <p className="text-white/70 text-sm">“Engineering imagination, one pixel at a time.”</p>
          </div>
        </div>

        {/* About Me Section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">About Me</h3>
          <p className="text-white/80 leading-relaxed text-sm">
            <span className="block mb-2">
              A versatile software developer with a strong foundation in both front-end and back-end development. With a
              focus on building scalable and efficient applications, I leverage my expertise to create seamless,
              user-centered experiences. My approach blends technical precision with a keen eye for design, enabling me
              to optimize performance and deliver innovative solutions.
            </span>
            <span className="block mb-2">
              In addition to leading the Techformers Club, I have worked on a wide range of projects, combining
              problem-solving with creativity to drive impactful results. Outside of programming, I am also a musician,
              filmmaker, and photographer, drawing inspiration from the arts to fuel my work.
            </span>
            <span className="block mb-2">
              Always seeking new challenges, I aim to continue evolving and crafting experiences that make a meaningful
              impact through technology.
            </span>
          </p>
        </div>

        {/* Pinned / Quick Links Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-center">
            <button
              onClick={() => {
                setPage("/links");
              }}
              className="text-white/80 underline-offset-1 hover:underline hover:text-white transition-all cursor-pointer"
            >
              Quick Links
            </button>
          </h3>
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

        {/* Experience Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Experience</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {/* Example Experience Card */}
            {experiences.map((experience, index) => (
              <ExperienceCard key={index} experience={experience} />
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Skills</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Example Skills Card */}
            {skills.map((skillGroup, index) => (
              <SkillsCard key={index} title={skillGroup.title} skills={skillGroup.skills} />
            ))}
          </div>
        </div>

        {/* Personal Projects Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Personal Projects</h3>
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

function ExperienceCard({ experience }: { experience: Experience }) {
  const { id, title, company, location, startDate, endDate, description, tags, logo } = experience;

  const fallbackLetter = company ? title.charAt(0).toUpperCase() : "E";
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
      key={id}
      className="relative overflow-hidden rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 z-0"></div>
      <div className="relative z-10 flex flex-col items-center text-center p-4 space-y-3">
        {/* Logo or Icon */}
        <div className="w-16 h-16">
          {logo ? (
            <div className="relative w-full h-full">
              <Image fill src={logo} alt={company} className="rounded-lg object-contain w-full h-full shadow" />
            </div>
          ) : (
            <div
              className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-xl shadow"
              style={{ backgroundColor: fallbackBgColor }}
            >
              {fallbackLetter}
            </div>
          )}
        </div>

        {/* Experience Info */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-white/70 text-sm">
            {company}
            {location ? ` • ${location}` : ""}
          </p>
          <p className="text-white/60 text-sm italic">
            {startDate} — {endDate || "Present"}
          </p>

          {description && <p className="text-white/80 text-sm mt-1">{description}</p>}

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkillsCard({ title, skills }: { title: string; skills: string[] }) {
  return (
    <div className="relative overflow-hidden rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/20">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 z-0"></div>
      <div className="relative z-10 flex flex-col items-center text-center p-4 space-y-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
