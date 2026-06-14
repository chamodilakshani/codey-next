'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ClientHero() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let frameId: number;

    const handleScroll = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const progress = Math.min(window.scrollY / 400, 1);
        setScrollProgress(progress);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  const headlineTransform = {
    transform: `translate3d(0, ${scrollProgress * -32}px, 0)`,
    opacity: `${1 - scrollProgress * 0.12}`,
  };

  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Sub-header badge with floating animation */}
      <span className="animate-float inline-flex items-center rounded-full border border-amber-200 bg-white/70 backdrop-blur-sm px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600 shadow-sm mb-8">
        ✨ The Magical Coding Academy for Kids
      </span>

      {/* Headings with per-letter bounce-in animation */}
      <div className="mb-0" style={headlineTransform}>
        <h1 className="text-6xl font-black tracking-tight text-slate-900 md:text-7xl leading-none mb-3">
          {"Welcome, Explorer!".split("").map((char, i) => (
            <span
              key={i}
              className="inline-block animate-bounce-in"
              style={{
                animationDelay: `${i * 35}ms`,
                animationFillMode: "both",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
        <h2
          className="text-5xl font-black tracking-tight md:text-6xl leading-none bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent animate-gradient-text"
          style={{ WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text", opacity: 1 }}
        >
          Learn to Code & Create
        </h2>
      </div>

      {/* Action buttons with fade-up stagger */}
      <div className="animate-fade-up delay-200 flex flex-wrap items-center justify-center gap-4 mt-12">
        <Button asChild>
          <Link
            href="/courses"
            className="rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black text-sm px-10 py-4 uppercase tracking-widest shadow-lg shadow-orange-400/40 hover:shadow-xl hover:shadow-orange-400/50 hover:-translate-y-0.5 transition-all duration-200"
          >
            Start Learning
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link
            href="/courses"
            className="rounded-full border-2 border-sky-300 bg-white/60 backdrop-blur-sm text-slate-800 font-black text-sm px-10 py-4 uppercase tracking-widest hover:bg-sky-50 hover:-translate-y-0.5 transition-all duration-200"
          >
            View All Lessons
          </Link>
        </Button>
      </div>

      {/* Divider */}
      <div className="animate-fade-up delay-300 w-2/3 border-t border-dashed border-slate-300/70 mx-auto mt-14 mb-10" />

      {/* Stats row */}
      <div className="animate-fade-up delay-300 flex flex-wrap justify-center items-center gap-12 text-center">
        {[
          { value: "4+", label: "Adventure Worlds" },
          { value: "40+", label: "Fun Lessons" },
          { value: "5", label: "Coding Languages" },
          { value: "100%", label: "Kid Friendly" },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            className="animate-fade-up"
            style={{ animationDelay: `${400 + idx * 50}ms`, animationFillMode: "both" }}
          >
            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
