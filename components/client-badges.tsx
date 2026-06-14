'use client';

import Image from "next/image";
import { useState } from "react";

interface Badge {
  img: string;
  name: string;
  desc: string;
}

interface ClientBadgesProps {
  badges: Badge[];
}

export function ClientBadges({ badges }: ClientBadgesProps) {
  const [flippedBadge, setFlippedBadge] = useState<string | null>(null);

  return (
    <div className="mt-10 flex flex-wrap justify-center gap-5">
      {badges.map((badge, idx) => (
        <div
          key={badge.name}
          className="animate-pop-in flex w-32 flex-col items-center rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:w-36 cursor-pointer perspective"
          style={{
            animationDelay: `${idx * 100}ms`,
            animationFillMode: "both",
            transformStyle: "preserve-3d",
            transform:
              flippedBadge === badge.name
                ? "rotateY(360deg)"
                : "rotateY(0deg)",
          }}
          onMouseEnter={() => setFlippedBadge(badge.name)}
          onMouseLeave={() => setFlippedBadge(null)}
        >
          {/* Badge front content */}
          <div
            className={`flex w-full flex-col items-center transition-opacity duration-300 ${
              flippedBadge === badge.name ? "opacity-50" : "opacity-100"
            }`}
          >
            <Image
              src={badge.img}
              alt={badge.name}
              width={60}
              height={60}
              className="drop-shadow transition-transform duration-300 group-hover:scale-110"
            />
            <h3 className="mt-3 text-center text-sm font-bold text-slate-900">
              {badge.name}
            </h3>
            <p className="mt-1 text-center text-xs text-slate-500">
              {badge.desc}
            </p>
          </div>

          {/* Badge back content (flip state) */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-amber-300 to-orange-400 p-5 text-center transition-opacity duration-300 ${
              flippedBadge === badge.name ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <span className="text-4xl mb-2">✨</span>
            <p className="text-xs font-bold text-white">Badge Unlocked!</p>
            <p className="text-xs text-white/90 mt-2">{badge.name}</p>
          </div>

          {/* Wiggle animation on flip */}
          <div
            className={`absolute inset-0 rounded-[1.5rem] transition-all duration-300 ${
              flippedBadge === badge.name ? "animate-wiggle" : ""
            }`}
          />
        </div>
      ))}
    </div>
  );
}
