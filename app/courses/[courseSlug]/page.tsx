import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BookOpenCheck, Clock3, PlayCircle, Map, Sparkles, Flag, ChevronDown } from "lucide-react";

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

// 🗺️ Light Theme Configuration for Levels (ඔයාගේ වර්ණ එලෙසම ඇත)
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
    bg: "bg-emerald-50/60 hover:bg-emerald-50/90",
    border: "border-emerald-200",
    textAccent: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    buttonVariant: "default",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
  },
  2: {
    bg: "bg-indigo-50/60 hover:bg-indigo-50/90",
    border: "border-indigo-200",
    textAccent: "text-indigo-700",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    buttonVariant: "default",
    buttonClass: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
  },
  3: {
    bg: "bg-amber-50/60 hover:bg-amber-50/90",
    border: "border-amber-200",
    textAccent: "text-amber-800",
    badge: "bg-amber-100 text-amber-900 border-amber-200",
    buttonVariant: "default",
    buttonClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm",
  },
  4: {
    bg: "bg-cyan-50/60 hover:bg-cyan-50/90",
    border: "border-cyan-200",
    textAccent: "text-cyan-700",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    buttonVariant: "default",
    buttonClass: "bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm",
  },
  5: {
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

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
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
  const isAdmin =
    Boolean(userId) && getRoleFromSessionClaims(sessionClaims) === "admin";

  if (!course || !course.isPublished || (course.isLocked && !isAdmin)) {
    notFound();
  }

  const courseWithLevels = { ...course, levels };
  const levelLessons = courseWithLevels.levels.flatMap(
    (level) => level.lessons,
  );
  const totalLessons = levelLessons.length || courseWithLevels.lessons.length;
  const firstLevel = courseWithLevels.levels[0] ?? null;
  const firstLesson =
    firstLevel?.lessons[0] ?? courseWithLevels.lessons[0] ?? null;

  return (
    // 🌲 Sky to Forest Gradient Base
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#e0f2fe] via-[#f0fdf4] to-[#dcfce7] text-slate-800 py-10 px-4 sm:px-8">
      
      {/* 🍃 Custom CSS Animations for Leaves and Clouds */}
      <style>{`
        @keyframes floatCloud {
          0% { transform: translateX(0px); }
          50% { transform: translateX(15px); }
          100% { transform: translateX(0px); }
        }
        @keyframes swayLeaf {
          0% { transform: rotate(0deg) translateY(0px); }
          50% { transform: rotate(10deg) translateY(-5px); }
          100% { transform: rotate(0deg) translateY(0px); }
        }
        .anim-cloud { animation: floatCloud 6s ease-in-out infinite; }
        .anim-leaf { animation: swayLeaf 4s ease-in-out infinite; }
      `}</style>

      {/* 🗺️ Magical SVG Forest Background Elements Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* ☁️ Cloud 1 (Top Left) */}
        <svg className="absolute top-10 left-[5%] w-28 h-auto opacity-60 anim-cloud" viewBox="0 0 100 60" fill="#ffffff">
          <path d="M20,40 Q10,40 15,30 Q15,15 30,20 Q40,5 55,15 Q70,5 80,20 Q95,20 90,35 Q90,40 80,40 Z" />
        </svg>

        {/* ☁️ Cloud 2 (Top Right) */}
        <svg className="absolute top-20 right-[8%] w-36 h-auto opacity-50 anim-cloud" style={{ animationDelay: '2s' }} viewBox="0 0 100 60" fill="#ffffff">
          <path d="M20,40 Q10,40 15,30 Q15,15 30,20 Q40,5 55,15 Q70,5 80,20 Q95,20 90,35 Q90,40 80,40 Z" />
        </svg>

        {/* 🌲 Left Side Forest Cluster (Visible on Larger Screens) */}
        <div className="absolute left-0 top-[25%] hidden xl:flex flex-col gap-12 opacity-40">
          {/* Cartoon Tree 1 */}
          <svg className="w-24 h-auto" viewBox="0 0 100 150">
            <rect x="45" y="100" width="10" height="50" fill="#78350f" />
            <polygon points="50,10 15,60 85,60" fill="#15803d" />
            <polygon points="50,35 20,80 80,80" fill="#166534" />
            <polygon points="50,55 25,100 75,100" fill="#14532d" />
          </svg>
          {/* Cartoon Tree 2 */}
          <svg className="w-20 h-auto ml-6" viewBox="0 0 100 120">
            <rect x="45" y="80" width="10" height="40" fill="#9a3412" />
            <circle cx="50" cy="50" r="40" fill="#16a34a" />
            <circle cx="35" cy="40" r="25" fill="#22c55e" />
          </svg>
        </div>

        {/* 🌲 Right Side Forest Cluster */}
        <div className="absolute right-2 top-[45%] hidden xl:flex flex-col gap-16 opacity-40">
          {/* Cartoon Tree 3 */}
          <svg className="w-24 h-auto" viewBox="0 0 100 120">
            <rect x="45" y="80" width="10" height="40" fill="#78350f" />
            <circle cx="50" cy="45" r="35" fill="#15803d" />
            <circle cx="65" cy="50" r="20" fill="#166534" />
          </svg>
          {/* Cartoon Tree 4 */}
          <svg className="w-20 h-auto mr-4" viewBox="0 0 100 150">
            <rect x="45" y="100" width="10" height="50" fill="#9a3412" />
            <polygon points="50,20 20,70 80,70" fill="#22c55e" />
            <polygon points="50,50 25,105 75,105" fill="#16a34a" />
          </svg>
        </div>

        {/* 🍃 Floating Magic Leaves around the map */}
        <svg className="absolute top-[15%] right-[20%] w-8 h-auto fill-emerald-400/50 anim-leaf" viewBox="0 0 24 24">
          <path d="M17,2 C14,2 10,5 9,9 C8,8 6,8 4,10 C2,12 2,15 4,17 C6,19 9,19 11,17 C15,18 19,14 20,10 C21,6 19,2 17,2 Z" />
        </svg>
        <svg className="absolute bottom-[30%] left-[5%] w-10 h-auto fill-green-400/40 anim-leaf" style={{ animationDelay: '1.5s' }} viewBox="0 0 24 24">
          <path d="M17,2 C14,2 10,5 9,9 C8,8 6,8 4,10 C2,12 2,15 4,17 C6,19 9,19 11,17 C15,18 19,14 20,10 C21,6 19,2 17,2 Z" />
        </svg>

        {/* ⛰️ Beautiful Layered Vector Hills at the bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] opacity-30">
          <svg className="relative block w-full h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,100 400,20 700,80 C1000,130 1100,50 1200,70 L1200,120 L0,120 Z" fill="#166534"></path>
          </svg>
        </div>
      </div>

      {/* ⚡ Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-4xl flex flex-col gap-12">
        
        {/* Playful Course Header Card */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both rounded-[2.5rem] border-4 border-white bg-white/80 backdrop-blur-md p-6 shadow-[0_20px_50px_rgba(21,128,61,0.05)] sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-12 transform -translate-y-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-b-xl shadow-sm flex items-center gap-1">
            <Sparkles className="size-3 animate-spin" style={{ animationDuration: '4s' }} /> Forest Quest
          </div>

          <p className="mb-2 text-xs font-black tracking-widest uppercase text-emerald-600 flex items-center gap-1.5">
            🌲 Welcome to your next Quest
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900">
            {course.title}
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600 leading-relaxed font-medium text-base">
            {course.description}
          </p>

          {/* Badges Container */}
          <div className="mt-6 flex flex-wrap gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-100/70 border border-emerald-200 px-3.5 py-1.5 font-bold text-emerald-700 shadow-sm">
              <BookOpenCheck className="size-4 text-emerald-500" />
              {totalLessons} Chapters
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-100/70 border border-amber-200 px-3.5 py-1.5 font-bold text-amber-700 shadow-sm">
              <Clock3 className="size-4 text-amber-500" />
              {course.durationMinutes} Mins
            </span>
            <span className="rounded-2xl bg-pink-100/70 border border-pink-200 px-3.5 py-1.5 font-bold text-pink-700 shadow-sm">
              👶 {getAgeGroupLabel(course.ageGroup)}
            </span>
            <span className="rounded-2xl bg-sky-100/70 border border-sky-200 px-3.5 py-1.5 font-bold text-sky-700 shadow-sm">
              🎮 {getDifficultyLabel(course.difficulty)}
            </span>
          </div>

          {firstLesson ? (
            <Button
              asChild
              className="mt-8 bg-gradient-to-r from-emerald-600 via-green-500 to-amber-500 hover:from-emerald-700 hover:to-amber-600 text-white font-extrabold text-base rounded-2xl px-8 py-6 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.03] active:scale-95"
            >
              <Link
                href={
                  firstLevel
                    ? `/courses/${course.slug}/levels/${firstLevel.slug}/lessons/${firstLesson.slug}`
                    : `/courses/${course.slug}/lessons/${firstLesson.slug}`
                }
              >
                Start Adventure Now 🎯
              </Link>
            </Button>
          ) : (
            <p className="mt-6 text-sm text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed">
              🚧 Wizarding lessons are being brewed. Check back soon!
            </p>
          )}
        </div>

        {/* Gamified Adventure Roadmap Map */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both space-y-6">
          <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md">
              <Map className="size-5" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Your Learning Adventure Map
            </h2>
          </div>

          {course.levels.length > 0 ? (
            // 🗺️ Winding Adventure Trail Path Container
            <div className="relative ml-4 sm:ml-8 border-l-4 border-dashed border-emerald-400/60 pl-6 sm:pl-12 space-y-12 py-4">
              
              {course.levels.map((level, index) => {
                const levelOrder = index + 1;
                const theme = LEVEL_THEMES[levelOrder] || DEFAULT_THEME;
                const isLast = index === course.levels.length - 1;

                return (
                  // 🎒 Dropdown Wrapper (<details>)
                  <details
                    key={level.id}
                    open={levelOrder === 1} // Keep first level open by default
                    className="relative group/level block rounded-[2.5rem] border-2 border-slate-100 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden transition-all open:shadow-md duration-300"
                  >
                    
                    {/* 📍 Gamified Map Pin Node Point */}
                    <div className="absolute left-0 top-6 transform -translate-x-[34px] sm:-translate-x-[58px] z-20 flex size-8 sm:size-10 items-center justify-center rounded-full border-4 border-white font-black text-sm text-white shadow-md bg-gradient-to-br from-emerald-500 to-green-600 transition-transform">
                      {isLast ? <Flag className="size-4 text-white animate-pulse" /> : levelOrder}
                    </div>

                    {/* 🗺️ Interactive Dropdown Header (<summary>) */}
                    <summary className="flex cursor-pointer list-none items-center justify-between bg-slate-50/60 px-5 py-4 select-none [&::-webkit-details-marker]:hidden hover:bg-slate-100/50 transition-colors">
                      <div className="space-y-0.5 pl-2 sm:pl-0">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                          Stage {levelOrder}
                        </span>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                          {level.title}
                        </h3>
                      </div>
                      
                      {/* Playful Animated Arrow */}
                      <div className="p-2 bg-white rounded-xl border-2 border-slate-100 text-slate-500 shadow-sm mr-1">
                        <ChevronDown className="size-5 transition-transform duration-300 group-open/level:rotate-180 text-slate-500" />
                      </div>
                    </summary>

                    {/* 🛡️ Quest Line Lessons Grid (Hidden when collapsed) */}
                    <div className="p-4 sm:p-5 bg-gradient-to-b from-white to-slate-50/20 border-t-2 border-slate-100 animate-in fade-in duration-300">
                      <div className="grid gap-3.5">
                        {level.lessons.map((lesson) => (
                          <article
                            key={lesson.id}
                            className={`rounded-2xl border-2 ${theme.border} ${theme.bg} p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm`}
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <span className={`text-[10px] font-extrabold uppercase tracking-widest bg-white/90 px-2 py-0.5 rounded-md border shadow-sm ${theme.textAccent}`}>
                                  ✨ Mission {lesson.displayOrder}
                                </span>

                                <h4 className="text-base font-black text-slate-900 tracking-tight">
                                  {lesson.title}
                                </h4>

                                <p className="text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
                                  {lesson.description}
                                </p>
                              </div>

                              {/* Action Buttons Panel */}
                              <div className="flex items-center justify-between border-t border-slate-200/40 pt-3 sm:pt-0 sm:border-0 sm:justify-end gap-3.5">
                                <span className="text-xs text-slate-500 font-bold whitespace-nowrap bg-white px-2.5 py-1 rounded-xl border-2 border-slate-100 shadow-sm">
                                  ⏱️ {lesson.durationMinutes} mins
                                </span>

                                <Button
                                  asChild
                                  variant={theme.buttonVariant}
                                  className={`text-xs h-9 px-4 font-black rounded-xl transition-all active:scale-95 shadow-sm transform hover:translate-x-0.5 ${theme.buttonClass}`}
                                >
                                  <Link
                                    href={`/courses/${course.slug}/levels/${level.slug}/lessons/${lesson.slug}`}
                                  >
                                    <PlayCircle className="mr-1 size-4" />
                                    Play
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          ) : (
            <p className="rounded-[2rem] border-4 border-dashed border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-400 italic">
              🏝️ This map is undiscovered. No stages available yet!
            </p>
          )}
        </section>
      </div>
    </div>
  );
}