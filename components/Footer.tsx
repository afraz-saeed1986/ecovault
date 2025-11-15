"use client";

import Link from "next/link";
import { SiNextdotjs, SiReact, SiTailwindcss, SiTypescript, SiLucide } from "react-icons/si";

export default function Footer() {
  const technologies = [
    {
      icon: SiNextdotjs,
      name: "Next.js",
      description: "React framework for SSR & SSG",
      url: "https://nextjs.org",
    },
    {
      icon: SiReact,
      name: "React",
      description: "UI library for building components",
      url: "https://reactjs.org",
    },
    {
      icon: SiTailwindcss,
      name: "Tailwind",
      description: "Utility-first CSS framework",
      url: "https://tailwindcss.com",
    },
    {
      icon: SiTypescript,
      name: "TypeScript",
      description: "Typed superset of JavaScript",
      url: "https://www.typescriptlang.org",
    },
    {
      icon: SiLucide,
      name: "Lucide",
      description: "Beautiful SVG icons library",
      url: "https://lucide.dev",
    },
  ];

  return (
    <footer className="bg-eco-green text-white mt-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-10">
          
          {/* تکنولوژی‌ها */}
          <div className="flex gap-10 flex-wrap justify-center">
            {technologies.map((tech) => {
              const Icon = tech.icon;
              return (
                <Link
                  key={tech.name}
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex flex-col items-center group"
                >
                  {/* آیکون */}
                  <Icon className="w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-300 transform group-hover:scale-110 text-white group-hover:text-gray-200" />

                  {/* نام تکنولوژی */}
                  <span className="text-sm sm:text-base mt-2 font-medium">{tech.name}</span>

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap z-10">
                    {tech.description}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* کپی‌رایت */}
          <p className="text-center text-sm text-gray-200 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Ecovault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
