'use client';

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAgeGroupLabel,
  getDifficultyLabel,
} from "@/lib/ui-labels";

const courseThemes: Record<string, { color: string; bgColor: string; gradient: string; emoji: string }> = {
  python: { color: "text-green-700", bgColor: "bg-green-50", gradient: "from-green-400 to-emerald-600", emoji: "🐍" },
  html: { color: "text-blue-700", bgColor: "bg-blue-50", gradient: "from-sky-400 to-blue-600", emoji: "🚀" },
  javascript: { color: "text-amber-700", bgColor: "bg-amber-50", gradient: "from-amber-400 to-orange-600", emoji: "🦕" },
  cpp: { color: "text-cyan-700", bgColor: "bg-cyan-50", gradient: "from-cyan-400 to-teal-600", emoji: "🌊" },
};

interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  ageGroup: string;
  difficulty: string;
  durationMinutes: number;
  thumbnailUrl: string;
  lessons: { id: string }[];
}

interface ClientCourseCardsProps {
  courses: Course[];
}

export function ClientCourseCards({ courses }: ClientCourseCardsProps) {
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {courses.map((course, idx) => {
        const thumbnailSrc = course.thumbnailUrl.startsWith("https://images.unsplash.com/")
          ? course.thumbnailUrl
          : "/course-placeholder.svg";

        const themeKeys = Object.keys(courseThemes);
        const theme = courseThemes[themeKeys[idx % themeKeys.length]];
        const delays = ["delay-100", "delay-200", "delay-300", "delay-400", "delay-500"];
        const delay = delays[idx % delays.length];

        return (
          <article
            key={course.id}
            className={`animate-pop-in ${delay} group relative overflow-hidden rounded-[1.75rem] border-2 border-slate-100 ${theme.bgColor} shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-slate-300/60 cursor-pointer`}
            style={{
              animationFillMode: "both",
            }}
            onMouseEnter={() => setHoveredCard(course.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Top gradient bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
              style={{ backgroundImage: `linear-gradient(90deg, var(--color-start), var(--color-end))` }}
            />

            {/* Theme badge */}
            <div className={`absolute top-3 left-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${theme.color} bg-white/90 backdrop-blur shadow-sm transition-all duration-300 group-hover:scale-110`}>
              <span className="text-lg">
                {themeKeys[idx % themeKeys.length] === "python" ? "🐍"
                  : themeKeys[idx % themeKeys.length] === "html" ? "🚀"
                  : themeKeys[idx % themeKeys.length] === "javascript" ? "✨"
                  : "🌊"}
              </span>
            </div>

            {/* Image container */}
            <div className={`relative h-48 overflow-hidden ${theme.bgColor}`}>
              <Image
                src={thumbnailSrc}
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 p-6">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${theme.color} ${theme.bgColor} border-2 border-slate-200 transition-all duration-300 group-hover:scale-105`}>
                  {getAgeGroupLabel(course.ageGroup)}
                </span>
                <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 border-2 border-slate-200 transition-all duration-300 group-hover:scale-105">
                  {getDifficultyLabel(course.difficulty)}
                </span>
                <span className="rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-700 border-2 border-slate-200 transition-all duration-300 group-hover:scale-105">
                  {course.durationMinutes} min
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {course.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {course.shortDescription}
                </p>
              </div>

              {/* Footer with lesson count and icon */}
              <div className="mt-auto flex items-center justify-between text-sm font-semibold text-slate-600">
                <span>📚 {course.lessons.length} Lessons</span>
                <PlayCircle
                  className={`h-5 w-5 text-orange-500 transition-all duration-300 ${
                    hoveredCard === course.id ? "animate-icon-rotate" : ""
                  }`}
                />
              </div>

              {/* CTA Button with shine effect */}
              <Button asChild className={`w-full rounded-full bg-gradient-to-r ${theme.gradient} text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group/button`}>
                <Link href={`/courses/${course.slug}`}>
                  <span className="relative z-10">🎮 Start Quest</span>
                  {/* Shine effect overlay */}
                  <span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover/button:opacity-100 transition-opacity duration-300"
                    style={{
                      animation: hoveredCard === course.id ? "shine 0.6s ease-out forwards" : "none",
                    }}
                  />
                </Link>
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
