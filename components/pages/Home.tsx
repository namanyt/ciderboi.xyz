"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useNetwork } from "@/components/context/Network";
import { Project, Experience, SkillGroup } from "@/lib/types";
import { ExternalLink, Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import NavigationButton from "@/components/NavigationButton";
import { redirect } from "next/navigation";

export default function Home({
  projects,
  skills,
  experiences,
}: {
  projects: Project[];
  experiences: Experience[];
  skills: SkillGroup[];
}) {
  const [showFullAbout, setShowFullAbout] = useState(false);

  return (
    <div className="h-screen w-full bg-cover bg-center overflow-hidden">
      {/* About the Image Icon */}
      <TooltipProvider>
        <Tooltip delayDuration={500}>
          <TooltipTrigger
            asChild
            onClick={(e) => {
              e.preventDefault();
              redirect("/photos?id=81cb0ed1");
            }}
          >
            <div className="fixed bottom-4 right-4 opacity-25 cursor-pointer hover:opacity-75 transition-opacity duration-250 z-60">
              <Info />
            </div>
          </TooltipTrigger>
          <TooltipContent side={"left"}>
            <p>About the Background</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Scrollable Card */}
      <div className="h-[90vh] w-[95vw] max-w-5xl mx-auto my-6 p-8 rounded-3xl backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl text-white overflow-y-auto scroll-smooth space-y-12">
        {/* Profile Section */}
        <section className="flex flex-col md:flex-row items-center gap-6">
          <Image
            src="/pictures/pfp-4.webp"
            alt="Nitya Naman - Creative Developer and Software Engineer at UPES"
            width={1288}
            height={1288}
            loading="lazy"
            draggable={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            style={{ objectFit: "contain" }}
            className="w-32 h-32 rounded-full object-cover border-2 border-white/30 shadow-md"
          />
          <div>
            <h1 className="text-3xl font-bold">Nitya Naman</h1>
            <p className="text-white/70 text-sm">"Engineering imagination, one pixel at a time."</p>
          </div>
        </section>

        {/* About Me Section */}
        <section>
          <h2
            className="text-xl font-semibold mb-4 flex items-center cursor-pointer group"
            onClick={() => setShowFullAbout(!showFullAbout)}
          >
            About Me
            <span className="ml-2 text-sm text-white/60 group-hover:text-white/80 transition-colors">
              {showFullAbout ? "(Click to collapse)" : "(Click to expand)"}
            </span>
          </h2>

          {/* Brief version always shown */}
          <p
            className={`text-white/80 leading-relaxed text-sm mb-3 ${showFullAbout ? "" : "cursor-pointer"}`}
            onClick={() => setShowFullAbout(true)}
          >
            Hey! I’m a first-year BTech CSE student at UPES who loves making stuff that lives at the edge of code,
            design, and storytelling. Whether it’s a quirky little project, a functional web app, or something that
            mixes hardware and creativity, I’m all about turning random ideas into working things—especially when
            there’s chaos, problem-solving, and fun involved.{" "}
          </p>

          {/* Full version shown conditionally */}
          {showFullAbout && (
            <div className="space-y-4 text-white/80 leading-relaxed text-sm mt-4 animate-fadeIn">
              <p>
                Back in school, I went on a bunch of wild side quests—like building a spooky chemistry escape game in
                just seven days with one teammate (science meets scary, literally), putting together a full coding
                library site overnight just for fun, and even making a posture-correcting device with an actual working
                app. None of them were perfect, but they were real—and they taught me a ton about deadlines, bug-hunting
                at weird hours, and how to bring big ideas to life.
              </p>

              <p>
                I also got to work behind the scenes at events—running AV systems, syncing lights for live performances,
                and helping design booths for inter-school exhibitions. That’s when I realized how much the small
                details—like where a light goes or how people move through a space—actually matter in creating an
                experience.
              </p>

              <p>
                Back in high school, I was the Head of the Techformers Club, which honestly was less about the
                “position” and more about vibing with other curious folks. We tried out random tools, hosted workshops,
                built things that sometimes broke (and sometimes didn’t), and mostly just geeked out together.
              </p>

              <p>
                Now, I’ve just started my journey at UPES as a first-year BTech CSE student. I recently took part in the
                Smart India Hackathon, and right now I’m exploring university life while experimenting with a few
                personal projects on the side. I’m excited about the road ahead—bigger builds, new collaborations, and
                joining more communities as I grow here.
              </p>

              <p>
                Outside of tech, I keep up with photography—sharing my latest shots on Instagram—and that creative side
                still bleeds into how I design and build things. Looking ahead, I’m super excited to explore projects
                that mix code, creativity, and real-world impact.
              </p>
            </div>
          )}
        </section>

        {/* Pinned / Quick Links Section */}
        <section>
          <h3 className="text-xl font-semibold mb-4 text-center">
            <NavigationButton
              href="/links"
              className="text-white/80 underline-offset-1 hover:underline hover:text-white transition-all cursor-pointer"
            >
              Quick Links
            </NavigationButton>
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <NavigationButton
              href="/music"
              className="w-32 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-sm text-center cursor-pointer"
            >
              🎧 Music
            </NavigationButton>
            <NavigationButton
              href="/photos"
              className="w-32 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-sm text-center cursor-pointer"
            >
              📸 Photos
            </NavigationButton>
          </div>
        </section>

        {/* Experience Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Experience</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {/* Example Experience Card */}
            {experiences
              .sort((a, b) => {
                return parseInt(a.id) - parseInt(b.id);
              })
              .map((experience, index) => (
                <ExperienceCard key={index} experience={experience} />
              ))}
          </div>
        </section>

        {/* Skills Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Example Skills Card */}
            {skills.map((skillGroup, index) => (
              <SkillsCard key={index} title={skillGroup.title} skills={skillGroup.skills} />
            ))}
          </div>
        </section>

        {/* Personal Projects Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Example Project Card */}
            {projects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

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
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-white/10 z-0"></div>
      <div className="relative z-10 flex flex-col items-center text-center p-4 space-y-3">
        {/* Image/Icon Section */}
        <div className="w-16 h-16">
          {image ? (
            <div className="relative w-full h-full">
              <Image
                src={image}
                alt={`${title} - ${category || "project"} by Nitya Naman`}
                fill
                sizes="64px"
                style={{ objectFit: "contain" }}
                className="rounded-lg drop-shadow-lg shadow"
                loading={"lazy"}
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
            <h3 className="text-lg font-semibold text-white text-left">
              <span
                className="hover:underline cursor-pointer"
                onClick={() => {
                  if (url) window.open(url, "_blank");
                }}
              >
                {title}
              </span>
            </h3>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            )}
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
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-white/10 z-0"></div>
      <div className="relative z-10 flex flex-col items-center text-center p-4 space-y-3">
        {/* Logo or Icon */}
        <div className="w-16 h-16">
          {logo ? (
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow">
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
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-white/10 z-0"></div>
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
