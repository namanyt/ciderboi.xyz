"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useNetwork } from "@/components/context/Network";
import { Project, Experience, SkillGroup } from "@/lib/types";
import { ExternalLink, Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import NavigationButton from "@/components/NavigationButton";

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
  const [showFullAbout, setShowFullAbout] = useState(false);

  return (
    <div className="h-screen w-full bg-cover bg-center overflow-hidden">
      {/* About the Image Icon */}
      <TooltipProvider>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild onClick={() => setPage("/photos?id=81cb0ed1")}>
            <div className="fixed bottom-4 right-4 opacity-25 cursor-pointer hover:opacity-75 transition-opacity duration-[250ms] z-[60]">
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
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Image
            src="/pictures/pfp-3.webp"
            alt="Profile"
            width={1288}
            height={1288}
            loading="lazy"
            draggable={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            style={{ objectFit: "contain" }}
            className="w-32 h-32 rounded-full object-cover border-2 border-white/30 shadow-md"
          />
          <div>
            <h2 className="text-3xl font-bold">Nitya Naman</h2>
            <p className="text-white/70 text-sm">“Engineering imagination, one pixel at a time.”</p>
          </div>
        </div>

        {/* About Me Section */}
        <div>
          <h3
            className="text-xl font-semibold mb-4 flex items-center cursor-pointer group"
            onClick={() => setShowFullAbout(!showFullAbout)}
          >
            About Me
            <span className="ml-2 text-sm text-white/60 group-hover:text-white/80 transition-colors">
              {showFullAbout ? "(Click to collapse)" : "(Click to expand)"}
            </span>
          </h3>

          {/* Brief version always shown */}
          <p
            className={`text-white/80 leading-relaxed text-sm mb-3 ${showFullAbout ? "" : "cursor-pointer"}`}
            onClick={() => setShowFullAbout(true)}
          >
            Hey! I’m a recent high school graduate who loves building stuff that lives at the edge of code, design, and
            storytelling. Whether it&#39;s a full-on horror game, a functional web app, or a weird little
            hardware-software mashup, I’m all about turning random ideas into working things—especially when there’s
            creative chaos involved and a bunch of problem-solving along the way.{" "}
          </p>

          {/* Full version shown conditionally */}
          {showFullAbout && (
            <div className="space-y-4 text-white/80 leading-relaxed text-sm mt-4 animate-fadeIn">
              <p>
                Over the past few years, I’ve dived into a bunch of side quests. Built a spooky chemistry escape game in
                seven days with just one other teammate (science meets scary, literally), launched a full coding book
                library site overnight just for the fun of it, and put together a posture-correcting device with an
                actual working app. They weren’t perfect, but they were real—and I learned a ton about time-crunches,
                fixing bugs at weird hours, and figuring out how to turn big ideas into something that works.
              </p>

              <p>
                I’ve also spent time behind-the-scenes at events—handling AV systems, syncing up lights for live
                performances, and helping design and set up booths at big inter-school exhibitions. That’s where I
                realized how much the small stuff—like where a light goes or how people move through a space—actually
                matters a lot.
              </p>

              <p>
                At school, I led the tech club, which honestly was more about vibing with other curious folks than
                anything official. We tried out random tools, hosted workshops, built things that sometimes broke (and
                sometimes didn’t), and mostly just geeked out together.
              </p>

              <p>
                Outside the tech world, I’m into music, filmmaking, and photography—and that creativity bleeds into the
                way I design, build, and think through projects. Whether it’s crafting smoother UI, storytelling through
                gameplay, or setting a visual mood, I like blending logic with feeling.
              </p>

              <p>
                Now, as I head into college, I’m just excited to keep learning, work with people who challenge me, and
                keep making things that feel fun, thoughtful, or straight-up bizarre in the best way. Especially the
                kind where code, creativity, and real-world impact all come together.
              </p>
            </div>
          )}
        </div>

        {/* Pinned / Quick Links Section */}
        <div>
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
