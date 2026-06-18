"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Award } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b ">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className="text-2xl">Verify Certificate</CardTitle>
              <CardDescription>
                Enter the certificate code to verify its authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <Label htmlFor="code">Certificate Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="CERT-1234567890-ABCDEF"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="uppercase font-mono"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Certificate"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {result.valid ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                  <CardTitle>
                    {result.valid ? "Certificate Verified" : "Invalid Certificate"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {result.valid && result.certificate ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Certificate Code</p>
                      <p className="font-mono font-semibold">{result.certificate.certificateCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recipient</p>
                      <p className="font-semibold">{result.certificate.recipient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Course Completed</p>
                      <p className="font-semibold">{result.certificate.course.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Issued On</p>
                      <p className="font-semibold">
                        {new Date(result.certificate.issuedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {result.error || "This certificate code is not valid or has not been issued."}
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
