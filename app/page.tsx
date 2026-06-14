import Link from "next/link";
import { Trophy } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

import { Button } from "@/components/ui/button";
import {
  getPublishedCourses,
} from "@/lib/course-data";
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
    <main className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(254,215,170,0.4),transparent_28%),radial-gradient(circle_at_top_right,rgba(253,164,175,0.25),transparent_20%),linear-gradient(180deg,#fffbeb_0%,#fef3c7_100%)] px-6 py-10 sm:px-10">
      <section className="mx-auto w-full max-w-6xl space-y-10">

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50/60 via-amber-50/40 to-yellow-50/60 px-8 py-20 shadow-[0_24px_80px_-40px_rgba(249,115,22,0.15)] sm:px-16 sm:py-28">
          {/* Ambient blobs */}
          <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl -translate-x-1/3 -translate-y-1/3" />
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-yellow-200/30 blur-3xl translate-x-1/4 -translate-y-1/4" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-96 rounded-full bg-amber-100/40 blur-3xl -translate-x-1/2 translate-y-1/3" />
          <div className="pointer-events-none absolute left-1/4 top-1/2 h-24 w-24 rounded-full bg-orange-200/20 blur-2xl" />

          {/* Client-side hero content with animations */}
          <ClientHero />
        </div>

        {/* ── How It Works ── */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-[0_24px_80px_-40px_rgba(59,130,246,0.2)] sm:p-10">
          <ClientHowItWorks />
        </section>

        {/* ── Courses Section ── */}
        <section className="space-y-10">
          <div className="text-center">
            <p className="animate-fade-up text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
              🌍 Choose Your Adventure
            </p>
            <h2 className="animate-fade-up delay-100 mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Pick Your World &amp; Start Coding!
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
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-b from-blue-50 to-sky-100 px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="animate-fade-up text-sm font-bold uppercase tracking-widest text-slate-500">
              Collect Them All
            </p>
            <h2 className="animate-fade-up delay-100 mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Earn Adventure Badges
            </h2>
            <p className="animate-fade-up delay-200 mt-3 text-lg leading-relaxed text-slate-600">
              Complete each world to unlock a special badge. Can you collect all five?
            </p>
          </div>

          <ClientBadges badges={badges} />
        </section>

      </section>
    </main>
  );
}