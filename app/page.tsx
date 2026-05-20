import Link from "next/link";
import Image from "next/image";
import { BookOpen, PlayCircle, Rocket, Sparkles, ShieldCheck, Trophy } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

import { Button } from "@/components/ui/button";
import {
  getAgeGroupLabel,
  getDifficultyLabel,
  getPublishedCourses,
} from "@/lib/course-data";

// Course theme data
const courseThemes: Record<string, { color: string; bgColor: string; gradient: string; emoji: string }> = {
  python: { color: "text-green-700", bgColor: "bg-green-50", gradient: "from-green-400 to-emerald-600", emoji: "🐍" },
  html: { color: "text-blue-700", bgColor: "bg-blue-50", gradient: "from-sky-400 to-blue-600", emoji: "🚀" },
  javascript: { color: "text-amber-700", bgColor: "bg-amber-50", gradient: "from-amber-400 to-orange-600", emoji: "🦕" },
  cpp: { color: "text-cyan-700", bgColor: "bg-cyan-50", gradient: "from-cyan-400 to-teal-600", emoji: "🌊" },
};

export default async function Home() {
  const { userId } = await auth();
  const courses = await getPublishedCourses();

  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(129,230,217,0.35),transparent_28%),radial-gradient(circle_at_top_right,rgba(248,113,113,0.22),transparent_20%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_100%)] px-6 py-10 sm:px-10">
      <section className="mx-auto w-full max-w-6xl space-y-10">
        <div className="flex flex-wrap justify-end gap-3">
          {userId ? (
            <Button asChild variant="outline" className="min-w-[10rem] rounded-full border-slate-200 bg-white/90 text-slate-900 shadow-sm shadow-sky-100/50">
              <Link href="/profile">My Profile</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="min-w-[10rem] rounded-full border-slate-200 bg-white/90 text-slate-900 shadow-sm shadow-sky-100/50">
            <Link href="/admin">Open Admin Dashboard</Link>
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-[0_24px_80px_-40px_rgba(59,130,246,0.35)] transition duration-300 sm:p-12">
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-200/40 blur-3xl"></div>
          <div className="pointer-events-none absolute right-6 top-20 h-36 w-36 rounded-full bg-amber-200/40 blur-3xl"></div>

          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 shadow-sm shadow-cyan-100/80 animate-swipe-up">
            <Sparkles className="h-4 w-4 text-cyan-700" />
            <span>✨ The magical coding academy for kids</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="animate-swipe-up delay-100 text-4xl font-black tracking-[-0.02em] text-slate-950 sm:text-6xl">
                <span className="block">Welcome, Explorer!</span>
                <span className="block bg-gradient-to-r from-orange-400 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
                  Learn to Code & Create
                </span>
              </h1>
              <p className="animate-swipe-up delay-200 max-w-2xl text-lg leading-8 text-slate-600">
                Start fun adventures with colorful lessons, mini projects, and friendly challenges.
                Everything is built for curious kids ages 6–12.
              </p>
            </div>

            <div className="animate-swipe-up delay-300 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="rounded-full bg-amber-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-amber-300/40 hover:bg-amber-600">
                <Link href="/courses">Start Learning</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="animate-swipe-up delay-100 rounded-[1.5rem] border border-slate-200 bg-sky-50/90 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">4+</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">Adventure Worlds</p>
              </div>
              <div className="animate-swipe-up delay-200 rounded-[1.5rem] border border-slate-200 bg-rose-50/90 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">40+</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">Fun Lessons</p>
              </div>
              <div className="animate-swipe-up delay-300 rounded-[1.5rem] border border-slate-200 bg-emerald-50/90 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">5</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">Coding Languages</p>
              </div>
              <div className="animate-swipe-up delay-400 rounded-[1.5rem] border border-slate-200 bg-violet-50/90 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">100%</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">Kid Friendly</p>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-[0_24px_80px_-40px_rgba(59,130,246,0.2)] sm:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="animate-swipe-up text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
              🎮 How It Works
            </p>
            <h2 className="animate-swipe-up delay-100 mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Your Coding Adventure Awaits
            </h2>
            <p className="animate-swipe-up delay-200 mt-4 text-lg leading-7 text-slate-600 sm:text-lg">
              Every world has 10 lessons, XP rewards, badges to unlock, and a final challenge.
              Learn by doing with fun, engaging activities! 🚀
            </p>
          </div>

          <div className="mt-10 grid grid-cols-4 gap-4">
            <div className="animate-swipe-up delay-100 group rounded-[1.25rem] border-2 border-slate-200 bg-slate-50 p-4 text-center shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold text-lg shadow-lg">
                1
              </div>
              <div className="mt-3 flex items-center justify-center text-2xl">
                🎯
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Pick a World</h3>
              <p className="mt-2 text-xs leading-4 text-slate-600">
                Choose Forest, Space, Jurassic, or Sea
              </p>
            </div>

            <div className="animate-swipe-up delay-200 group rounded-[1.25rem] border-2 border-slate-200 bg-slate-50 p-4 text-center shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-white font-bold text-lg shadow-lg">
                2
              </div>
              <div className="mt-3 flex items-center justify-center text-2xl">
                📖
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Complete Lessons</h3>
              <p className="mt-2 text-xs leading-4 text-slate-600">
                10 fun lessons with quizzes & games
              </p>
            </div>

            <div className="animate-swipe-up delay-300 group rounded-[1.25rem] border-2 border-slate-200 bg-slate-50 p-4 text-center shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-600 text-white font-bold text-lg shadow-lg">
                3
              </div>
              <div className="mt-3 flex items-center justify-center text-2xl">
                ⭐
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Earn XP & Badges</h3>
              <p className="mt-2 text-xs leading-4 text-slate-600">
                Collect points & unlock badges
              </p>
            </div>

            <div className="animate-swipe-up delay-400 group rounded-[1.25rem] border-2 border-slate-200 bg-slate-50 p-4 text-center shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-teal-600 text-white font-bold text-lg shadow-lg">
                4
              </div>
              <div className="mt-3 flex items-center justify-center text-2xl">
                🏆
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Final Challenge</h3>
              <p className="mt-2 text-xs leading-4 text-slate-600">
                Beat the boss level & win glory!
              </p>
            </div>
          </div>
        </section>

        {/* ═════════════ COURSES SECTION ═════════════ */}
        <section className="space-y-10">
          <div className="text-center">
            <p className="animate-swipe-up text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
              🌍 Choose Your Adventure
            </p>
            <h2 className="animate-swipe-up delay-100 mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Pick Your World & Start Coding!
            </h2>
            <p className="animate-swipe-up delay-200 mt-4 text-lg leading-7 text-slate-600 max-w-2xl mx-auto">
              Four magical worlds, each teaching a core coding concept. Where will your adventure begin? 🚀
            </p>
          </div>

        {courses.length > 0 ? (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
                  className={`animate-swipe-up ${delay} group relative overflow-hidden rounded-[1.75rem] border-2 border-slate-100 ${theme.bgColor} shadow-lg shadow-slate-200/50 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-300/60`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r" style={{backgroundImage: `linear-gradient(90deg, var(--color-start), var(--color-end))`,}} />
                  
                  <div className={`absolute top-3 left-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${theme.color} bg-white/90 backdrop-blur shadow-sm`}>
                    <span className="text-lg">{themeKeys[idx % themeKeys.length] === "python" ? "🐍" : themeKeys[idx % themeKeys.length] === "html" ? "🚀" : themeKeys[idx % themeKeys.length] === "javascript" ? "✨" : "🌊"}</span>
                  </div>

                  <div className={`relative h-48 overflow-hidden ${theme.bgColor}`}>
                    <Image
                      src={thumbnailSrc}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col gap-4 p-6">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${theme.color} ${theme.bgColor} border-2 border-slate-200`}>
                        {getAgeGroupLabel(course.ageGroup)}
                      </span>
                      <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 border-2 border-slate-200">
                        {getDifficultyLabel(course.difficulty)}
                      </span>
                      <span className="rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-700 border-2 border-slate-200">
                        {course.durationMinutes} min
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">
                        {course.title}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {course.shortDescription}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between text-sm font-semibold text-slate-600">
                      <span>📚 {course.lessons.length} Lessons</span>
                      <PlayCircle className="h-5 w-5 text-orange-500" />
                    </div>

                    <Button asChild className={`w-full rounded-full bg-gradient-to-r ${theme.gradient} text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition`}>
                      <Link href={`/courses/${course.slug}`}>🎮 Start Quest</Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="animate-swipe-up rounded-[1.75rem] border-2 border-slate-200 bg-white/90 p-10 text-center shadow-lg">
            <Trophy className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-3xl font-bold text-slate-900">No Quests Available Yet</h2>
            <p className="mt-3 text-lg text-slate-600">
              Check back soon for epic coding adventures! 🚀
            </p>
          </section>
        )}
        </section>
          <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-b from-blue-50 to-sky-100 px-6 py-14 sm:px-10 sm:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Collect Them All
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Earn Adventure Badges
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-slate-600">
                Complete each world to unlock a special badge. Can you collect
                all five?
              </p>
            </div>
 
            <div className="mt-10 flex flex-wrap justify-center gap-5">
              {[
                {
                  img: "/image/beginner.png",
                  name: "Beginner",
                  desc: "Complete Part 1",
                },
                {
                  img: "/image/thinker.png",
                  name: "Thinker",
                  desc: "Complete Part 2",
                },
                {
                  img: "/image/smart.png",
                  name: "Smart",
                  desc: "Complete Part 3",
                },
                {
                  img: "/image/loopmaster.png",
                  name: "Loop Master",
                  desc: "Complete Part 4",
                },
                {
                  img: "/image/PYTHON_PRO.png",
                  name: "Python Pro",
                  desc: "Complete All Parts",
                },
              ].map((badge) => (
                <div
                  key={badge.name}
                  className="flex w-32 flex-col items-center rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:w-36"
                >
                  <Image
                    src={badge.img}
                    alt={badge.name}
                    width={60}
                    height={60}
                    className="drop-shadow"
                  />
                  <h3 className="mt-3 text-center text-sm font-bold text-slate-900">
                    {badge.name}
                  </h3>
                  <p className="mt-1 text-center text-xs text-slate-500">
                    {badge.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    
  );
}