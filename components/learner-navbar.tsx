"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Award, BookOpenCheck, Home, LayoutDashboard, LogIn, LogOut, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

const hiddenPathPrefixes = ["/admin", "/dashboard", "/sign-in", "/sign-up", "/api"];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function LearnerNavbar() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  if (hiddenPathPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const role = user?.publicMetadata?.role;
  const isAdmin = role === "admin";
  const links = [
    { href: "/", label: "Courses", icon: Home },
    { href: "/profile", label: "Profile", icon: UserRound },
    { href: "/certificate/my", label: "Certificates", icon: Award },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-orange-200/70 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-slate-950">
          <span className="flex size-9 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
            <BookOpenCheck className="size-5" />
          </span>
          <span className="text-base font-black tracking-tight">CodePlay</span>
        </Link>

        <div className="order-3 flex w-full items-center gap-2 overflow-x-auto sm:order-2 sm:w-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = isActivePath(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-orange-100 text-orange-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            );
          })}

          {isAdmin ? (
            <Link
              href="/dashboard"
              className="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          ) : null}
        </div>

        <div className="order-2 flex items-center gap-2 sm:order-3">
          {isSignedIn ? (
            <SignOutButton>
              <Button variant="outline" size="sm">
                <LogOut className="size-4" />
                Logout
              </Button>
            </SignOutButton>
          ) : (
            <SignInButton mode="modal">
              <Button size="sm">
                <LogIn className="size-4" />
                Sign In
              </Button>
            </SignInButton>
          )}
        </div>
      </nav>
    </header>
  );
}
