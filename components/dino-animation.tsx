"use client";

import dynamic from "next/dynamic";
import animationData from "@/public/lottie/dino-dancing.json";


const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function DinoAnimation() {
  return (
    <div className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-md">
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
}