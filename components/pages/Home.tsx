"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useNetwork } from "@/components/context/Network";
import { Project, Experience, SkillGroup } from "@/lib/types";
import { ChevronDown, ExternalLink, Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import NavigationButton from "@/components/NavigationButton";
import { redirect } from "next/navigation";
import { ScrollArea } from "@radix-ui/react-scroll-area";

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
    <div className="h-dvh w-full flex flex-col items-center justify-start md:justify-center bg-cover bg-center px-3 py-8 sm:px-4 sm:py-6 pb-20 sm:pb-6 overflow-y-auto md:overflow-hidden">
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
            <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-25 cursor-pointer hover:opacity-75 transition-opacity duration-250 z-[60]">
              <Info />
            </div>
          </TooltipTrigger>
          <TooltipContent side={"left"}>
            <p>About the Background</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Scrollable Card */}
      <div className="w-full max-w-5xl mx-auto px-2 py-0 sm:px-0 sm:py-0 md:p-6 lg:p-8 rounded-xl md:rounded-3xl backdrop-blur-none md:backdrop-blur-md bg-transparent md:bg-black/30 border-0 md:border md:border-white/10 shadow-none md:shadow-2xl text-white max-h-none md:max-h-[90dvh] overflow-visible md:overflow-y-auto scroll-smooth space-y-8 sm:space-y-10 md:space-y-12">
        {/* Profile Section */}
        <section className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-2 border-white/30 shadow-md shrink-0 overflow-hidden">
            <Image
              src="/pictures/pfp.jpg"
              alt="Nitya Naman - Creative Developer and Software Engineer at UPES"
              width={1079}
              height={1100}
              loading="lazy"
              draggable={false}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              className="h-full w-full object-cover scale-[1.5]"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">Nitya Naman</h1>
            <p className="text-white/70 text-sm">"Engineering imagination, one pixel at a time."</p>
          </div>
        </section>

        {/* About Me Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer"
              aria-expanded={showFullAbout}
              aria-controls="about-me-content"
              onClick={() => setShowFullAbout(!showFullAbout)}
            >
              About Me
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 text-white/70 transition-transform duration-200 ${showFullAbout ? "rotate-180" : "rotate-0"}`}
              />
            </button>
          </h2>

          <div id="about-me-content">
            {/* Brief version always shown */}
            <p
              className={`text-white/80 leading-relaxed text-sm mb-3 break-words ${showFullAbout ? "" : "cursor-pointer"}`}
              onClick={() => setShowFullAbout(true)}
            >
              I'm a Computer Science student at UPES who spends most of his time building software, infrastructure, games, and the occasional hardware project.
              I enjoy turning ideas into working systems, learning whatever tools a problem demands, and exploring the space where technology, creativity,
              and engineering overlap. Most of my projects start with curiosity and end with me diving far deeper into a topic than originally intended.{" "}
              {!showFullAbout && <span className="ml-1 text-xs text-white/70 underline">Read more...</span>}
            </p>

            {/* Full version shown conditionally */}
            {showFullAbout && (
              <div className="space-y-4 text-white/80 leading-relaxed text-sm mt-4 animate-fadeIn break-words">
                <p>
                  What started as curiosity gradually turned into years of projects spread across software development, infrastructure,
                  game development, hardware, media production, and a growing collection of side quests. I've never been particularly good at
                  staying inside a single discipline. If something interests me, I'll usually end up learning whatever is needed to
                  build it—whether that's writing backend services, deploying Linux servers, designing databases, building game systems,
                  wiring sensors to microcontrollers, or experimenting with entirely new technologies.
                </p>

                <p>
                  Over the years I've built educational software, technical resource platforms, production web applications, self-hosted infrastructure,
                  embedded hardware prototypes, internal tools, automation systems, games, and plenty of experimental projects that existed
                  simply because I wanted to see if they could be built. Some became real deployments, some were competition projects,
                  and some never left my own machine.
                </p>

                <p>
                  One of the areas I enjoy most is systems design. I like understanding how complex pieces fit together—whether that's a database architecture,
                  a deployment pipeline, a game engine subsystem, or an operational workflow. That interest naturally led me into running my own infrastructure,
                  maintaining Linux servers, self-hosting services, and learning the operational side of software alongside development.
                </p>

                <p>
                  Before university, I served as Head of the Techformers Club at Delhi Public School, where I helped organize technical initiatives,
                  competitions, workshops, livestreaming infrastructure, media production, and inter-school events. I also participated in various
                  national-level competitions, building projects ranging from educational games and programming platforms to embedded hardware
                  systems and mobile applications. Those experiences taught me a lot about working under pressure, adapting to constraints,
                  and solving problems when things inevitably go wrong.
                </p>

                <p>
                  My interests today sit somewhere between software engineering, infrastructure, systems architecture, graphics, and game development.
                  Recently I've worked on production-scale web platforms, academic management systems, self-hosted services, and experimental engine development projects.
                  I enjoy the entire process of building—from the initial concept and architecture to deployment, maintenance, optimization,
                  and the inevitable debugging sessions at unreasonable hours.
                </p>

                <p>
                  Outside of technology, I spend time making music, photographing things that catch my eye, experimenting with filmmaking,
                  and collecting hobbies faster than I can finish them. Those creative interests often find their way back into my technical work,
                  influencing how I design experiences, approach problem-solving, and think about the things I build.
                </p>
              </div>
            )}
          </div>
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
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
            <NavigationButton
              href="/music"
              className="w-full sm:w-32 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-sm text-center cursor-pointer"
            >
              🎧 Music
            </NavigationButton>
            <NavigationButton
              href="/photos"
              className="w-full sm:w-32 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-sm text-center cursor-pointer"
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
      className="group relative overflow-hidden rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/20"
    >
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-white/10 z-0"></div>
      <div className="relative z-10 flex flex-col items-center text-center p-4 space-y-3 min-w-0">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${title} in a new tab`}
            className="pointer-events-none absolute right-3 top-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 text-white/70 hover:text-white"
          >
            <ExternalLink size={16} />
          </a>
        )}
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
        <div className="space-y-2 min-w-0 w-full">
          <div>
            <h3 className="min-w-0 text-lg font-semibold text-white text-center break-words">
              <span
                className={url ? "hover:underline cursor-pointer" : ""}
                onClick={() => {
                  if (url) window.open(url, "_blank");
                }}
              >
                {title}
              </span>
            </h3>
          </div>

          <p className="text-white/80 text-sm break-words">{description}</p>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {tags &&
              tags.map((tag, index) => (
                <span
                  key={index}
                  className="max-w-full px-3 py-1 text-xs rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white break-words"
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
      <div className="relative z-10 flex flex-col items-center text-center p-4 space-y-3 min-w-0">
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
        <div className="space-y-2 min-w-0 w-full">
          <h3 className="text-lg font-semibold text-white break-words">{title}</h3>
          <p className="text-white/70 text-sm">
            {company}
            {location ? ` • ${location}` : ""}
          </p>
          <p className="text-white/60 text-sm italic">
            {startDate} — {endDate || "Present"}
          </p>

          {description && <p className="text-white/80 text-sm mt-1 break-words">{description}</p>}

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="max-w-full px-3 py-1 text-xs rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white break-words"
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
      <div className="relative z-10 flex flex-col items-center text-center p-4 space-y-3 min-w-0">
        <h3 className="text-lg font-semibold text-white break-words">{title}</h3>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="max-w-full px-3 py-1 text-xs rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white break-words"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
