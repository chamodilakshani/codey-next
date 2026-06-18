'use client';

import { useState } from "react";
import { motion } from "framer-motion"

export function ClientHowItWorks() {
  const [tiltedCard, setTiltedCard] = useState<number | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    setTiltedCard(index);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 10;
    const y = -(e.clientX - rect.left - rect.width / 2) / 10;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTiltedCard(null);
    setTilt({ x: 0, y: 0 });
  };

  const steps = [
    { num: 1, emoji: "🎯", title: "Pick a World", desc: "Choose Forest, Space, Jurassic, or Sea" },
    { num: 2, emoji: "📖", title: "Complete Lessons", desc: "10 fun lessons with quizzes & games" },
    { num: 3, emoji: "⭐", title: "Earn XP & Badges", desc: "Collect points & unlock badges" },
    { num: 4, emoji: "🏆", title: "Final Challenge", desc: "Beat the boss level & win glory!" },
  ];

  const gradients = [
    "from-green-400 to-emerald-600",
    "from-sky-400 to-blue-600",
    "from-amber-400 to-orange-600",
    "from-cyan-400 to-teal-600",
  ];

  return (
    <div className="space-y-10">
      <div className="mx-auto max-w-3xl text-center">
        <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="animate-fade-up text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
          🎮 How It Works
        </motion.p>
          <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl"  >
              Your Coding Adventure Awaits
            </motion.h2>
        <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="animate-fade-up delay-200 mt-4 text-lg leading-7 text-slate-600 sm:text-lg">
          Every world has 10 lessons, XP rewards, badges to unlock, and a final challenge. Learn by doing with fun, engaging activities! 🚀
        </motion.p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, idx) => (
          <div
            key={step.num}
            className="animate-fade-up group relative overflow-hidden rounded-[1.25rem] border-2 border-slate-200 bg-slate-50 p-4 text-center shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            style={{
              animationDelay: `${100 + idx * 100}ms`,
              animationFillMode: "both",
              transformStyle: "preserve-3d",
              transform:
                tiltedCard === idx
                  ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                  : "rotateX(0) rotateY(0)",
            }}
            onMouseMove={(e) => handleMouseMove(e, idx)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Number circle with scale animation */}
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${gradients[idx]} text-white font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-110`}
            >
              {step.num}
            </div>

            {/* Emoji */}
            <div className="mt-3 flex items-center justify-center text-2xl">{step.emoji}</div>

            {/* Title */}
            <h3 className="mt-3 text-sm font-bold text-slate-900">{step.title}</h3>

            {/* Description */}
            <p className="mt-2 text-xs leading-4 text-slate-600">{step.desc}</p>

            {/* Hover border glow */}
            <div className="absolute inset-0 rounded-[1.25rem] border-2 border-transparent bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
