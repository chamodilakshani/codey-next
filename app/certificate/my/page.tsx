"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Download, ExternalLink, Trophy, Verified } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Certificate = {
  id: string;
  certificateCode: string;
  issuedAt: string;
  course: {
    title: string;
    slug: string;
    thumbnailUrl: string;
  };
};

export default function MyCertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/certificate/my")
      .then((res) => res.json())
      .then((data) => {
        setCertificates(data.certificates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDownload = (cert: Certificate) => {
    const printWindow = window.open("", "_blank");
    printWindow?.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${cert.course.title}</title>
          <style>
            body { font-family: Georgia, serif; text-align: center; padding: 50px; background: #f9fafb; }
            .certificate { border: 12px double #8b5cf6; padding: 40px; max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border-radius: 20px; }
            .title { font-size: 44px; color: #7c3aed; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
            .subtitle { font-size: 22px; color: #4b5563; margin-bottom: 30px; }
            .recipient { font-size: 38px; font-weight: bold; color: #f97316; margin: 30px 0; font-family: 'Comic Sans MS', sans-serif; }
            .course { font-size: 30px; color: #2563eb; font-weight: bold; margin: 20px 0; }
            .code { font-family: monospace; font-size: 14px; color: #9ca3af; margin-top: 40px; background: #f3f4f6; padding: 5px 15px; display: inline-block; border-radius: 20px; }
            .date { font-size: 16px; color: #6b7280; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="title">🥇 Certificate of Completion 🥇</div>
            <div class="subtitle">This proudly certifies that</div>
            <div class="recipient">Codey Kids Learner</div>
            <div class="subtitle">has successfully completed the magical adventure course</div>
            <div class="course">✨ ${cert.course.title} ✨</div>
            <div class="date">Issued on ${new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
            <div class="code">Verification Code: ${cert.certificateCode}</div>
          </div>
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-purple-50/50 via-white to-orange-50/30 px-4 py-12 sm:px-6 lg:px-8">
      
      {/* ✨ Ambient Magical Background Blobs */}
      <div className="pointer-events-none absolute left-[-10%] top-[10%] h-[400px] w-[400px] rounded-full bg-purple-300/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[20%] h-[500px] w-[500px] rounded-full bg-yellow-200/20 blur-3xl" />
      <div className="pointer-events-none absolute left-[30%] top-[60%] h-[350px] w-[350px] rounded-full bg-pink-200/15 blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* 🏷️ Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 drop-shadow-sm">
              <Award className="w-10 h-10 text-purple-500 animate-pulse" />
              My Certificates
            </h1>
            <p className="text-purple-700/70 font-medium mt-2 text-base">
              Your magical badges of honor! Keep coding and collecting them all! 🌟
            </p>
          </div>

          <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 rounded-full px-6 py-6 transition-all duration-300 hover:scale-105 active:scale-95">
            <Link href="/certificate/verify" className="flex items-center gap-2">
              <Verified className="h-5 w-5" />
              Verify Certificate
            </Link>
          </Button>
        </div>

        {/* ⏳ Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-purple-600 font-medium">Summoning your certificates...</p>
          </div>
        ) : certificates.length === 0 ? (
          
          /* 🏆 Empty State (No Certificates Card) */
          <Card className="border border-white/60 bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-xl p-8 text-center max-w-xl mx-auto">
            <CardHeader className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Trophy className="w-10 h-10 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">No Certificates Yet!</CardTitle>
              <CardDescription className="text-gray-600 font-medium mt-2">
                Your shelf is ready for trophies! Complete courses and score **70% or higher** on quizzes to earn your first certificate. ✨
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <Button 
                onClick={() => router.push("/")}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-full px-8 py-6 shadow-md transition-transform hover:scale-105"
              >
                Browse Courses
              </Button>
              <Button asChild variant="outline" className="border-purple-200 bg-white/80 hover:bg-purple-50 rounded-full px-8 py-6 font-semibold text-purple-700 shadow-sm">
                <Link href="/certificate/verify">
                  Verify a Code
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          
          /* 🎴 Colorful Certificates Grid */
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card key={cert.id} className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/50 backdrop-blur-xl shadow-[0_20px_50px_rgba(139,92,246,0.06)] transition-all duration-300 hover:shadow-[0_24px_60px_rgba(139,92,246,0.15)] hover:-translate-y-2">
                
                {/* Top Colorful Card Decor strip */}
                <div className="h-3 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400" />

                <CardHeader className="p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-3 bg-purple-100/80 text-purple-600 rounded-2xl shadow-sm">
                      <Award className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold font-mono text-purple-700 bg-purple-100/60 px-3 py-1.5 rounded-full border border-purple-200/50">
                      ID: {cert.certificateCode}
                    </span>
                  </div>
                  <CardTitle className="mt-6 text-xl font-bold text-gray-800 leading-snug group-hover:text-purple-700 transition-colors">
                    {cert.course.title}
                  </CardTitle>
                  <CardDescription className="text-gray-500 font-medium mt-2">
                    Earned on{" "}
                    {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6 pt-0 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-purple-200/80 bg-white/80 text-purple-700 font-semibold hover:bg-purple-50 hover:text-purple-800 rounded-xl py-5 transition-all"
                    onClick={() =>
                      router.push(`/certificate/verify?code=${cert.certificateCode}`)
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2 text-purple-500" />
                    View Certificate
                  </Button>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-xl py-5 shadow-md shadow-orange-500/10 transition-all hover:brightness-105"
                    onClick={() => handleDownload(cert)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}