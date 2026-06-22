"use client";

import { SignUp } from "@clerk/nextjs";
import Lottie from "lottie-react";
import animationData from "./Le Petit Chat _Cat_ Noir.json"; // Path එක නිවැරදිදැයි බලන්න

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-pink-200 via-yellow-100 via-green-200 to-cyan-200 px-4 py-12 font-sans">
      
      {/* Decorative Background Bubbles */}
      <div className="absolute top-10 left-10 h-32 w-32 animate-pulse rounded-full bg-white/40 blur-xl"></div>
      <div className="absolute bottom-10 right-20 h-48 w-48 animate-bounce rounded-full bg-pink-300/30 blur-2xl"></div>
      <div className="absolute right-1/4 top-1/4 h-24 w-24 rounded-full bg-yellow-300/40 blur-lg"></div>

      {/* Main Wrapper */}
      <div className="relative z-10 pt-32">
        
        {/* Form Container */}
        <div className="relative">
          
          {/* Lottie Animation (Perfect positioning above SignUp) */}
          <div className="absolute -top-73 left-1/2 z-30 h-44 w-44 -translate-x-1/2 pointer-events-none drop-shadow-xl transition-transform duration-300 hover:scale-110">
            <Lottie animationData={animationData} loop={true} />
          </div>

          {/* Playful Glassmorphic Card */}
          <div className="relative rounded-[40px] border-4 border-white/70 bg-white/60 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <SignUp
              forceRedirectUrl="/dashboard"
              appearance={{
                layout: {
                  socialButtonsVariant: "blockButton",
                  logoPlacement: "inside",
                },
                variables: {
                  colorPrimary: "#ec4899", 
                  colorText: "#374151",
                  borderRadius: "24px", 
                },
                elements: {
                  card: "bg-transparent shadow-none", 
                  
                  headerTitle: "text-center text-3xl font-extrabold text-pink-500 mt-6",
                  headerSubtitle: "text-center font-bold text-gray-600",
                  
                  // Cute Input Fields
                  formFieldInput:
                    "rounded-3xl border-4 border-pink-100 bg-white px-5 py-3 text-lg font-medium shadow-inner transition-all focus:border-yellow-400 focus:ring-yellow-400",
                  formFieldLabel: "ml-2 text-md font-extrabold text-gray-700",
                  
                  // Rainbow Action Button
                  formButtonPrimary:
                    "rounded-3xl bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400 px-8 py-4 text-xl font-extrabold uppercase tracking-wider text-white shadow-lg shadow-orange-300/50 transition-all duration-300 hover:scale-105 hover:from-pink-500 hover:via-orange-500 hover:to-yellow-500 active:scale-95",
                  
                  // Social buttons
                  socialButtonsBlockButton:
                    "rounded-3xl border-4 border-white bg-white/80 py-3 shadow-sm transition-all hover:bg-yellow-50",
                  socialButtonsBlockButtonText: "font-extrabold text-gray-700",

                  footerActionLink:
                    "font-extrabold text-pink-500 transition-colors hover:text-pink-600",
                  footer: "bg-transparent",
                },
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}