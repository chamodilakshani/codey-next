"use client";

import dynamic from "next/dynamic";

// Lottie client-side withari render wena nisa dynamic import karanawa
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function ClientLottie({ animationData, className }: { animationData: any; className?: string }) {
  return (
    <div className={className}>
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
}