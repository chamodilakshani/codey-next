import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LearnerNavbar } from "@/components/learner-navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
export const dynamic = 'force-dynamic'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codey Kids Academy",
  description: "Kid-friendly course platform with guided video lessons.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <LearnerNavbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
    </TooltipProvider>
  );
}
