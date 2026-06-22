"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import Lottie from "lottie-react";


import spaceBoyAnimation from "./space_boy.json";

type VerificationResult = {
  valid: boolean;
  certificate?: {
    id: string;
    certificateCode: string;
    issuedAt: string;
    course: {
      title: string;
      slug: string;
    };
    recipient: {
      name: string;
      email?: string;
    };
  };
  error?: string;
};


const BUBBLES = [
  { left: "8%", size: "45px", delay: "0s", duration: "14s", bg: "bg-purple-200/40" },
  { left: "22%", size: "25px", delay: "2s", duration: "16s", bg: "bg-orange-200/50" },
  { left: "38%", size: "65px", delay: "4s", duration: "20s", bg: "bg-pink-200/40" },
  { left: "52%", size: "35px", delay: "1s", duration: "15s", bg: "bg-blue-200/40" },
  { left: "68%", size: "75px", delay: "5s", duration: "22s", bg: "bg-yellow-100/60" },
  { left: "82%", size: "28px", delay: "3s", duration: "13s", bg: "bg-purple-200/40" },
  { left: "93%", size: "55px", delay: "7s", duration: "18s", bg: "bg-pink-200/50" },
  { left: "18%", size: "40px", delay: "6s", duration: "15s", bg: "bg-orange-200/40" },
  { left: "78%", size: "50px", delay: "2s", duration: "19s", bg: "bg-blue-200/50" },
];

export default function CertificateVerifyPage() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setCode(urlCode);
      verifyCertificate(urlCode);
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    verifyCertificate(code);
  };

  const verifyCertificate = async (verifyCode: string) => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/certificate/verify?code=${encodeURIComponent(verifyCode)}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, error: "Failed to verify certificate" });
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🌈 Bright & Soft Pastel Gradient Background
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#f3e8ff]/60 via-[#fae8ff]/40 to-[#ffedd5]/50 text-slate-800">
      
      {/* 🔮 Light Mode Soap-Bubble-Like CSS Animation */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(110vh) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-10vh) scale(1.1) rotate(360deg);
            opacity: 0;
          }
        }
        .animated-bubble {
          position: absolute;
          bottom: -100px;
          border-radius: 50%;
          backdrop-filter: blur(2px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.6), 0 4px 12px rgba(0, 0, 0, 0.02);
          animation: floatUp linear infinite;
          pointer-events: none;
        }
      `}</style>

      {/* 🎈 Pastel Floating Bubbles Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {BUBBLES.map((bubble, index) => (
          <div
            key={index}
            className={`animated-bubble ${bubble.bg}`}
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              animationDelay: bubble.delay,
              animationDuration: bubble.duration,
            }}
          />
        ))}
      </div>

      {/* ✨ Magic Ambient Pastel Glows */}
      <div className="pointer-events-none absolute left-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-purple-300/30 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[15%] h-[500px] w-[500px] rounded-full bg-orange-200/30 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4 py-16 flex flex-col justify-center min-h-screen">
        <div className="max-w-xl w-full mx-auto">
          
          {/* Light Glassmorphic Card */}
          <Card className="mb-8 overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/60 backdrop-blur-2xl shadow-[0_30px_70px_rgba(139,92,246,0.06)] text-slate-800">
            <CardHeader className="text-center pb-2 pt-8">
              
              {/* 🧑‍🚀 Space Boy Lottie Animation Container */}
              <div className="w-52 h-52 mx-auto mb-2 flex items-center justify-center drop-shadow-[0_10px_25px_rgba(168,85,247,0.15)]">
                <Lottie 
                  animationData={spaceBoyAnimation} 
                  loop={true}
                  className="w-full h-full"
                />
              </div>

              <CardTitle className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 tracking-wide">
                Verify Certificate
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 font-semibold mt-2">
                Enter your magical code to check your certificate authenticity ✨
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-purple-600 font-bold ml-1 tracking-wider text-xs uppercase">
                    Secret Verification Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="e.g. CERT-123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="uppercase font-mono text-center text-xl py-6 rounded-2xl border-purple-100 bg-white/80 text-slate-800 placeholder:text-slate-300 focus-visible:ring-purple-400 shadow-inner tracking-widest transition-all duration-300 focus:border-purple-300"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:to-orange-500 text-white font-extrabold text-lg rounded-2xl py-6 shadow-md shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Scanning Database...
                    </span>
                  ) : (
                    "Verify Badge 🚀"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result Card */}
          {result && (
            <Card className="animate-in fade-in-50 slide-in-from-bottom-6 duration-500 rounded-[2.5rem] border border-white/80 bg-white/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden text-slate-800">
              <div className={`h-2 w-full ${result.valid ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-rose-400 to-pink-500"}`} />
              <CardHeader className="pt-6">
                <div className="flex flex-col items-center justify-center gap-2">
                  {result.valid ? (
                    <div className="p-3 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-500 animate-bounce mb-1">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50 rounded-full border border-rose-100 text-rose-500 animate-pulse mb-1">
                      <XCircle className="w-10 h-10" />
                    </div>
                  )}
                  <CardTitle className="text-2xl font-extrabold tracking-wide text-slate-800">
                    {result.valid ? "Awesome! It's Verified!" : "Verification Failed"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8 text-center">
                {result.valid && result.certificate ? (
                  <div className="space-y-3 text-left bg-purple-50/50 p-6 rounded-2xl border border-purple-100/50">
                    <div className="flex justify-between items-center border-b border-purple-100/60 pb-2.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-600">Code</p>
                      <p className="font-mono font-bold text-sm bg-purple-100/80 text-purple-700 px-3 py-1 rounded-md border border-purple-200">{result.certificate.certificateCode}</p>
                    </div>
                    <div className="flex justify-between items-center border-b border-purple-100/60 pb-2.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-600">Student Name</p>
                      <p className="font-bold text-slate-700 text-sm">{result.certificate.recipient.name}</p>
                    </div>
                    <div className="flex justify-between items-center border-b border-purple-100/60 pb-2.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-600">Course Completed</p>
                      <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-sm max-w-[240px] text-right">{result.certificate.course.title}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-600">Issued On</p>
                      <p className="font-bold text-slate-500 text-sm">
                        {new Date(result.certificate.issuedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-rose-600 text-sm font-semibold bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm">
                    {result.error || "This certificate code is not valid or has not been issued yet."}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}