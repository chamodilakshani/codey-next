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
            body { font-family: Georgia, serif; text-align: center; padding: 50px; }
            .certificate { border: 10px solid #1a56db; padding: 40px; max-width: 800px; margin: 0 auto; }
            .title { font-size: 48px; color: #1a56db; margin-bottom: 20px; }
            .subtitle { font-size: 24px; color: #666; margin-bottom: 30px; }
            .recipient { font-size: 36px; font-weight: bold; margin: 30px 0; }
            .course { font-size: 28px; color: #1a56db; margin: 20px 0; }
            .code { font-family: monospace; font-size: 14px; color: #999; margin-top: 40px; }
            .date { font-size: 16px; color: #666; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="title">Certificate of Completion</div>
            <div class="subtitle">This certifies that</div>
            <div class="recipient">Codey Kids Learner</div>
            <div class="subtitle">has successfully completed the course</div>
            <div class="course">${cert.course.title}</div>
            <div class="date">Issued on ${new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
            <div class="code">Certificate Code: ${cert.certificateCode}</div>
          </div>
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Award className="w-8 h-8" />
          My Certificates
        </h1>
        <p className="text-muted-foreground mt-2">
          Certificates you&apos;ve earned by completing courses
        </p>
      </div>

      <div className="mb-6 flex justify-end">
        <Button asChild variant="outline">
          <Link href="/certificate/verify">
            <Verified className="mr-2 h-4 w-4" />
            Verify Certificate
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading certificates...</p>
      ) : certificates.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              No Certificates Yet
            </CardTitle>
            <CardDescription>
              Complete courses to earn certificates. Pass all quizzes with 70% or higher!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => router.push("/")}>
              Browse Courses
            </Button>
            <Button asChild variant="outline">
              <Link href="/certificate/verify">
                Verify a Certificate
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Award className="w-8 h-8 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    {cert.certificateCode}
                  </span>
                </div>
                <CardTitle className="mt-4">{cert.course.title}</CardTitle>
                <CardDescription>
                  Issued on{" "}
                  {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.push(`/certificate/verify?code=${cert.certificateCode}`)
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Certificate
                </Button>
                <Button
                  className="w-full"
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
  );
}
