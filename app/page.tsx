import Link from "next/link";
import { Trophy } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

import { Button } from "@/components/ui/button";
import { getPublishedCourses } from "@/lib/course-data";
import { ClientHero } from "@/components/client-hero";
import { ClientHowItWorks } from "@/components/client-how-it-works";
import { ClientCourseCards } from "@/components/client-course-cards";
import { ClientBadges } from "@/components/client-badges";
import { ClientLottie } from "@/components/client-lottie"; // 👈 Aluth Lottie Component eka

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
    // 🌈 Eye-pleasing Pastel Rainbow Background
    <main className="relative overflow-hidden min-h-screen bg-gradient-to-tr from-rose-100 via-amber-100 via-emerald-100 via-sky-100 to-violet-100">

      {/* ── Soft Magical Background Glows ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-pink-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-cyan-200/40 rounded-full blur-[150px]" />
      </div>

      {/* ── Floating Snowflakes ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="snow snow-1">❄</span>
        <span className="snow snow-2">❄</span>
        <span className="snow snow-3">❄</span>
        <span className="snow snow-4">❄</span>
        <span className="snow snow-5">❄</span>
      </div>

      <section className="relative z-10 mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:px-6">

       {/* ── Hero Banner Wrapper Container ── */}
<div className="relative w-full max-w-5xl mx-auto pt-2 pb-6 mt-0">
  
  {/* 🐻 Left Side: Bear Lottie  */}
  <div className="absolute z-20 -bottom-0 -left-6 sm:-left-12 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-float pointer-events-none">
    <ClientLottie 
      animationData={require('../public/lottie/bear-game.json')} 
      className="w-full h-full"
    />
  </div>

  {/* 🦉 Right Side: Owls Lottie (දකුණු කෙළවරේම ස්ථිරව ඇත) */}
  <div className="absolute z-20 -top-0 -right-0 sm:-right-24 lg:-right-32 w-48 h-48 sm:w-64 sm:h-64 lg:90 lg:h-90 drop-shadow-[0_20px_50px_rgba(0,0,0,0.12)] opacity-95 animate-float pointer-events-none" style={{ animationDelay: '0.5s' }}>
    <ClientLottie 
      animationData={require('../public/lottie/owls.json')} 
      className="w-full h-full"
    />
  </div>

  {/* 🏛️ Main White Hero Banner Box */}
  <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-xl px-6 py-14 shadow-[0_24px_70px_-15px_rgba(139,92,246,0.15)] sm:px-16 sm:py-20 text-center">
    
    {/* Subtle Color Blobs inside Hero */}
    <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl -translate-x-1/3 -translate-y-1/3" />
    <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-yellow-200/30 blur-3xl translate-x-1/3 translate-y-1/3" />
    
    {/* Center Text Content (අකුරු එක පේළියට ගැනීමට max-w-3xl දක්වා වැඩි කර ඇත) */}
    <div className="relative z-10 max-w-2xl lg:max-w-3xl mx-auto flex flex-col items-center justify-center px-4 sm:px-8">
      <ClientHero />
    </div>

  </div>
</div>
            

        {/* ── How It Works ── */}
        <section className="rounded-[2.5rem] border border-white/80 bg-white/70 backdrop-blur-md p-8 shadow-[0_20px_50px_-20px_rgba(99,102,241,0.1)] sm:p-10">
          <ClientHowItWorks />
        </section>

        {/* ── Courses Section ── */}
        <section className="space-y-10 pt-4">
          <div className="text-center">
            <p className="animate-fade-up text-sm font-black uppercase tracking-[0.25em] text-pink-500">
              🌍 Choose Your Adventure
            </p>
            <h2 className="animate-fade-up delay-100 mt-4 text-3xl font-black tracking-tight text-slate-800 sm:text-5xl">
              Pick Your World &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Start Coding!</span>
            </h2>
            <p className="animate-fade-up delay-200 mt-4 text-lg leading-7 text-slate-600 max-w-2xl mx-auto">
              Four magical worlds, each teaching a core coding concept. Where will your adventure begin? 🚀
            </p>
          </div>

          {courses.length > 0 ? (
            <ClientCourseCards courses={courses} />
          ) : (
            <div className="animate-fade-up rounded-[2rem] border border-white/80 bg-white/80 backdrop-blur-md p-10 text-center shadow-lg">
              <Trophy className="mx-auto h-14 w-14 text-amber-500 mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold text-slate-800">No Quests Available Yet</h2>
              <p className="mt-3 text-lg text-slate-600">
                Check back soon for epic coding adventures! 🚀
              </p>
            </div>
          )}
        </section>

        {/* ── Badges Section ── */}
        <section className="rounded-[2.5rem] border border-white/80 bg-gradient-to-b from-white/60 to-violet-50/60 backdrop-blur-md px-6 py-14 shadow-[0_24px_60px_-30px_rgba(139,92,246,0.15)] sm:px-10 sm:py-20">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <p className="animate-fade-up text-sm font-bold uppercase tracking-widest text-violet-600">
              ✨ Collect Them All
            </p>
            <h2 className="animate-fade-up delay-100 mt-3 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
              Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">Adventure Badges</span>
            </h2>
            <p className="animate-fade-up delay-200 mt-3 text-lg leading-relaxed text-slate-600">
              Complete each world to unlock a special badge. Can you collect all five?
            </p>
          </div>
          <ClientBadges badges={badges} />
        </section>

        {/* ── Footer ── */}
        <footer className="rounded-[2rem] border border-slate-800 bg-slate-950 px-8 py-10 sm:px-16 shadow-xl">
          <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <span className="text-base font-bold text-white">CodePlay</span>
            </div>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} CodePlay. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-400">
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