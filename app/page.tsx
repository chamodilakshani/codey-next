
import Link from "next/link";
import { Trophy } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

import { Button } from "@/components/ui/button";
import { getPublishedCourses } from "@/lib/course-data";
import { ClientHero } from "@/components/client-hero";
import { ClientHowItWorks } from "@/components/client-how-it-works";
import { ClientCourseCards } from "@/components/client-course-cards";
import { ClientBadges } from "@/components/client-badges";

export default async function Home() {
  const { userId } = await auth();
  const courses = await getPublishedCourses();

  const badges = [
    { img: "/image/beginner.png",   name: "Beginner",    desc: "Complete Part 1" },
    { img: "/image/thinker.png",    name: "Thinker",     desc: "Complete Part 2" },
    { img: "/image/smart.png",      name: "Smart",       desc: "Complete Part 3" },
    { img: "/image/loopmaster.png", name: "Loop Master", desc: "Complete Part 4" },
    { img: "/image/PYTHON_PRO.png", name: "Python Pro",  desc: "Complete All Parts" },
  ];

  return (
    <main className="relative overflow-hidden min-h-screen bg-gradient-to-br rainbow-page-bg from-white via-blue-50 to-purple-50">

      {/* ── Animated Rainbow Background ── */}


      {/* ── Floating Snowflakes ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="snow snow-1">❄</span>
        <span className="snow snow-2">❄</span>
        <span className="snow snow-3">❄</span>
        <span className="snow snow-4">❄</span>
        <span className="snow snow-5">❄</span>
      </div>

      <section className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10">

        {/* ── Hero Banner ── */}
        <div className="hero-rainbow-bg relative overflow-hidden rounded-[2rem] px-8 py-20 shadow-[0_24px_80px_-20px_rgba(139,92,246,0.25)] sm:px-16 sm:py-28"
             style={{ border: "1.5px solid #e0e7ff" }}>
          {/* Blobs */}
          <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-purple-300/20 blur-3xl -translate-x-1/3 -translate-y-1/3" />
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-pink-300/20 blur-3xl translate-x-1/4 -translate-y-1/4" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-96 rounded-full bg-sky-200/30 blur-3xl -translate-x-1/2 translate-y-1/3" />
          <div className="pointer-events-none absolute left-1/4 top-1/2 h-28 w-28 rounded-full bg-green-200/25 blur-2xl" />
          <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-20 w-20 rounded-full bg-amber-200/25 blur-2xl" />
          <ClientHero />
        </div>

        {/* ── How It Works ── */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-[0_24px_80px_-40px_rgba(99,102,241,0.2)] sm:p-10">
          <ClientHowItWorks />
        </section>

        {/* ── Courses Section ── */}
        <section className="space-y-10">
          <div className="text-center">
            <p className="animate-fade-up text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
              🌍 Choose Your Adventure
            </p>
            <h2 className="animate-fade-up delay-100 mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Pick Your World &amp;{" "}
              <span className="rainbow-text">Start Coding!</span>
            </h2>
            <p className="animate-fade-up delay-200 mt-4 text-lg leading-7 text-slate-600 max-w-2xl mx-auto">
              Four magical worlds, each teaching a core coding concept. Where will your adventure begin? 🚀
            </p>
          </div>

          {courses.length > 0 ? (
            <ClientCourseCards courses={courses} />
          ) : (
            <div className="animate-fade-up rounded-[1.75rem] border-2 border-slate-200 bg-white/90 p-10 text-center shadow-lg">
              <Trophy className="mx-auto h-12 w-12 text-amber-500 mb-4" />
              <h2 className="text-3xl font-bold text-slate-900">No Quests Available Yet</h2>
              <p className="mt-3 text-lg text-slate-600">
                Check back soon for epic coding adventures! 🚀
              </p>
            </div>
          )}
        </section>

        {/* ── Badges Section ── */}
        <section className="badges-rainbow-bg rounded-[2rem] px-6 py-14 shadow-[0_24px_80px_-40px_rgba(139,92,246,0.25)] sm:px-10 sm:py-20"
                 style={{ border: "1.5px solid #e0e7ff" }}>
          <div className="mx-auto max-w-3xl text-center">
            <p className="animate-fade-up text-sm font-bold uppercase tracking-widest text-indigo-500">
              ✨ Collect Them All
            </p>
            <h2 className="animate-fade-up delay-100 mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Earn <span className="rainbow-text">Adventure Badges</span>
            </h2>
            <p className="animate-fade-up delay-200 mt-3 text-lg leading-relaxed text-slate-600">
              Complete each world to unlock a special badge. Can you collect all five?
            </p>
          </div>
          <ClientBadges badges={badges} />
        </section>

        {/* ── Footer ── */}
        <footer className="rounded-[2rem] border border-blue-900/20 bg-[#0f172a] px-8 py-10 sm:px-16">
          <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-bold text-white">CodePlay</span>
            </div>
            <p className="text-sm text-blue-300">
              © {new Date().getFullYear()} CodePlay. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-blue-300">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </footer>

      </section>
    </main>
  );
}