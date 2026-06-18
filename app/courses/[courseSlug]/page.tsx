import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BookOpenCheck, ChevronDown, Clock3, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getAgeGroupLabel,
  getCourseBySlug,
  getDifficultyLabel,
  getLevelsByCourseSlug,
} from "@/lib/course-data";
import { getRoleFromSessionClaims } from "@/lib/clerk-role";

type CoursePageProps = {
  params: Promise<{ courseSlug: string }>;
};

// 🗺️ Light Theme Configuration for Levels
type ThemeStyle = {
  bg: string;
  border: string;
  textAccent: string;
  badge: string;
  buttonVariant: "default" | "outline" | "secondary";
  buttonClass: string;
};

const LEVEL_THEMES: Record<number, ThemeStyle> = {
  1: {
    // 🌲 Forest Theme (Soft mint background, deep emerald text)
    bg: "bg-emerald-50/60 hover:bg-emerald-50/90",
    border: "border-emerald-200",
    textAccent: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    buttonVariant: "default",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
  },
  2: {
    // 🚀 Astro Theme (Soft lavender background, deep cosmic indigo text)
    bg: "bg-indigo-50/60 hover:bg-indigo-50/90",
    border: "border-indigo-200",
    textAccent: "text-indigo-700",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    buttonVariant: "default",
    buttonClass: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
  },
  3: {
    // 🦖 Jurassic Theme (Soft earth-amber background, rich volcanic brown/orange text)
    bg: "bg-amber-50/60 hover:bg-amber-50/90",
    border: "border-amber-200",
    textAccent: "text-amber-800",
    badge: "bg-amber-100 text-amber-900 border-amber-200",
    buttonVariant: "default",
    buttonClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm",
  },
  4: {
    // 🐙 Deep Sea Theme (Soft oceanic cyan/teal background, deep teal text)
    bg: "bg-cyan-50/60 hover:bg-cyan-50/90",
    border: "border-cyan-200",
    textAccent: "text-cyan-700",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    buttonVariant: "default",
    buttonClass: "bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm",
  },
  5: {
    // ⚡ Mini Project / Cyberpunk Theme (Soft pastel fuchsia background, vibrant dark berry text)
    bg: "bg-fuchsia-50/60 hover:bg-fuchsia-50/90",
    border: "border-fuchsia-200",
    textAccent: "text-fuchsia-700",
    badge: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    buttonVariant: "default",
    buttonClass: "bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-sm",
  },
};

const DEFAULT_THEME: ThemeStyle = {
  bg: "bg-slate-50 hover:bg-slate-100/80",
  border: "border-slate-200",
  textAccent: "text-slate-700",
  badge: "bg-slate-100 text-slate-800 border-slate-200",
  buttonVariant: "outline",
  buttonClass: "bg-white hover:bg-slate-50 text-slate-700 border-slate-200",
};

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await getCourseBySlug(courseSlug);

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return {
    title: `${course.title} | Codey Kids`,
    description: course.shortDescription,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  const levels = await getLevelsByCourseSlug(courseSlug);
  const { userId, sessionClaims } = await auth();
  const isAdmin = Boolean(userId) && getRoleFromSessionClaims(sessionClaims) === "admin";

  if (!course || !course.isPublished || (course.isLocked && !isAdmin)) {
    notFound();
  }

  const courseWithLevels = { ...course, levels };
  const levelLessons = courseWithLevels.levels.flatMap((level) => level.lessons);
  const totalLessons = levelLessons.length || courseWithLevels.lessons.length;
  const firstLevel = courseWithLevels.levels[0] ?? null;
  const firstLesson = firstLevel?.lessons[0] ?? courseWithLevels.lessons[0] ?? null;

  return (
    <main className="min-h-full bg-slate-50 px-6 py-8 sm:px-10 text-slate-800 transition-colors duration-500">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        
        {/* Course Header Card */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-xs font-bold tracking-wider uppercase text-blue-600">Course</p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900">{course.title}</h1>
          <p className="mt-3 max-w-3xl text-slate-600 leading-relaxed text-base">{course.description}</p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 font-semibold text-blue-700">
              <BookOpenCheck className="size-4" />
              {totalLessons} lessons
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 font-medium text-slate-600">
              <Clock3 className="size-4" />
              {course.durationMinutes} mins
            </span>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 font-medium text-slate-600">
              {getAgeGroupLabel(course.ageGroup)}
            </span>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 font-medium text-slate-600">
              {getDifficultyLabel(course.difficulty)}
            </span>
          </div>

          {firstLesson ? (
            <Button asChild className="mt-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all transform hover:scale-[1.02]">
              <Link
                href={
                  firstLevel
                    ? `/courses/${course.slug}/levels/${firstLevel.slug}/lessons/${firstLesson.slug}`
                    : `/courses/${course.slug}/lessons/${firstLesson.slug}`
                }
              >
                Start First Lesson
              </Link>
            </Button>
          ) : (
            <p className="mt-6 text-sm text-slate-400 italic">
              Lessons for this course are being prepared. Check back soon.
            </p>
          )}
        </div>

        {/* Levels & Lessons Map */}
        <section className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-2">
            Course Map & Stages
          </h2>

          {course.levels.length > 0 ? (
            course.levels.map((level, index) => {
              const levelOrder = index + 1;
              const theme = LEVEL_THEMES[levelOrder] || DEFAULT_THEME;

              return (
                <div key={level.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                  
                  {/* Stage Title Area */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                      <span className={`inline-flex items-center justify-center size-6 text-xs font-bold rounded-md border ${theme.badge}`}>
                        {levelOrder}
                      </span>
                      {level.title}
                    </h3>
                  </div>

                  {/* Lessons Listing */}
                  <div className="grid gap-3 pl-1 sm:pl-2">
                    {level.lessons.map((lesson) => (
                      <article
                        key={lesson.id}
                        className={`rounded-2xl border ${theme.border} ${theme.bg} p-4 transition-all duration-300 hover:scale-[1.005] hover:shadow-sm`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-0.5">
                            <span className={`text-xs font-bold uppercase tracking-wider ${theme.textAccent}`}>
                              Lesson {lesson.displayOrder}
                            </span>
                            <h4 className="text-base font-bold text-slate-900 tracking-tight">{lesson.title}</h4>
                            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">{lesson.description}</p>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 sm:pt-0 sm:border-0 sm:justify-end gap-4">
                            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                              {lesson.durationMinutes} mins
                            </span>
                            
                            <Button 
                              asChild 
                              variant={theme.buttonVariant} 
                              className={`text-xs h-9 px-4 font-semibold transition-all transform active:scale-95 ${theme.buttonClass}`}
                            >
                              <Link href={`/courses/${course.slug}/levels/${level.slug}/lessons/${lesson.slug}`}>
                                <PlayCircle className="mr-1.5 size-4" />
                                Watch
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              No levels or lessons available for this course yet.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}