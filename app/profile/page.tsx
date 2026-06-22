import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRoleFromUser, parseLessonActivityMap } from "@/lib/clerk-role";
import prisma from "@/lib/prisma";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { DinoAnimation } from "@/components/dino-animation"; 

type CourseProgress = {
  slug: string;
  title: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lastVisitedAt: string | null;
  lessons: Array<{
    id: string;
    title: string;
    slug: string;
    levelSlug: string;
    isCompleted: boolean;
    lastVisitedAt?: string;
    quizScorePercent?: number;
  }>;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "No activity yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No activity yet";
  return date.toLocaleString();
}

// Pastel Rainbow Color themes per course index
const courseColors = [
  { bar: "bg-gradient-to-r from-pink-300 to-rose-400", badge: "bg-pink-100 text-pink-700 border-pink-200", ring: "ring-pink-200" },
  { bar: "bg-gradient-to-r from-purple-300 to-fuchsia-400", badge: "bg-purple-100 text-purple-700 border-purple-200", ring: "ring-purple-200" },
  { bar: "bg-gradient-to-r from-sky-300 to-blue-400", badge: "bg-sky-100 text-sky-700 border-sky-200", ring: "ring-sky-200" },
  { bar: "bg-gradient-to-r from-emerald-300 to-teal-400", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", ring: "ring-emerald-200" },
];

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = getRoleFromUser(user);

  const email =
    user.emailAddresses?.[0]?.emailAddress ??
    (user.primaryEmailAddress as { emailAddress?: string })?.emailAddress ??
    null;

  const localUser = email
    ? await prisma.user.findUnique({ where: { email } })
    : null;

  const imageUrl = (localUser as { imageUrl?: string })?.imageUrl ?? user.imageUrl;
  const userName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    localUser?.name ||
    "Learner";

  /* ── Admin view ── */
  if (role === "admin") {
    return (
      <main className="min-h-full bg-gradient-to-br from-pink-50 via-purple-50 to-sky-50 px-6 py-10 sm:px-10">
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Profile</h1>
            </div>
            <Link
              href="/dashboard"
              className="rounded-full border border-purple-200 bg-white px-5 py-2 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-50"
            >
              Go To Dashboard
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-sm backdrop-blur-xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-purple-200">
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Admin Account</h2>
            <p className="mt-2 text-sm text-slate-500">
              Learner progress is tracked only for users with the{" "}
              <code className="rounded bg-pink-100 text-pink-700 px-1.5 py-0.5 font-mono text-xs">learner</code>{" "}
              role.
            </p>
          </div>
        </section>
      </main>
    );
  }

  /* ── Data ── */
  const activityMap = parseLessonActivityMap(user.privateMetadata?.lessonActivity);
  const activityEntries = Object.values(activityMap);
  const trackedCourseSlugs = Array.from(
    new Set(activityEntries.map((entry) => entry.courseSlug).filter((slug) => slug.length > 0))
  );

  const courses = await prisma.course.findMany({
    where: {
      slug: { in: trackedCourseSlugs.length > 0 ? trackedCourseSlugs : ["__none__"] },
      isPublished: true,
      isLocked: false,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      levels: {
        include: {
          lessons: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
            orderBy: {
              displayOrder: "asc",
            },
          },
        },
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
    orderBy: { title: "asc" },
  });

  const progressByCourse: CourseProgress[] = courses.map((course) => {
    const lessons = course.levels.flatMap((level) =>
      level.lessons.map((lesson) => ({
        ...lesson,
        levelSlug: level.slug,
      }))
    );
    const entriesForCourse = activityEntries.filter((entry) => entry.courseSlug === course.slug);
    const completedLessonIds = new Set(
      entriesForCourse.filter((e) => Boolean(e.videoCompletedAt)).map((e) => e.lessonId)
    );

    const completedLessons = lessons.filter((lesson) =>
      completedLessonIds.has(lesson.id)
    ).length;
    const totalLessons = lessons.length;
    const progressPercent =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const lastVisitedAt =
      entriesForCourse
        .map((e) => e.lastVisitedAt ?? null)
        .filter((v): v is string => Boolean(v))
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
    const lessonEntryById = new Map(entriesForCourse.map((e) => [e.lessonId, e]));

    return {
      slug: course.slug,
      title: course.title,
      totalLessons,
      completedLessons,
      progressPercent,
      lastVisitedAt,
      lessons: lessons.map((lesson) => {
        const activity = lessonEntryById.get(lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          slug: lesson.slug,
          levelSlug: lesson.levelSlug,
          isCompleted: Boolean(activity?.videoCompletedAt),
          lastVisitedAt: activity?.lastVisitedAt,
          quizScorePercent: activity?.quizScorePercent,
        };
      }),
    };
  });

  const totalLessons = progressByCourse.reduce((s, c) => s + c.totalLessons, 0);
  const completedLessons = progressByCourse.reduce((s, c) => s + c.completedLessons, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <main className="min-h-full bg-gradient-to-br from-pink-50 via-purple-50 to-sky-50 px-6 py-10 sm:px-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">

        {/* Header Section with Lottie Animation */}
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[2.5rem] bg-white/60 p-6 shadow-sm backdrop-blur-md border border-white/80">
          <div className="flex items-center gap-4 sm:gap-6">
            <DinoAnimation /> {}
            
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={userName} 
                  className="h-16 w-16 rounded-full object-cover shadow-md ring-4 ring-white"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-400 text-3xl shadow-md ring-4 ring-white text-white font-bold">
                  {userName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                  Welcome, {userName}!
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Track your lessons, quizzes, and adventure progress! ✨
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-50 hover:-translate-y-0.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back To Courses
              </Link>
              <EditProfileModal 
                firstName={user.firstName}
                lastName={user.lastName}
                imageUrl={user.imageUrl}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="rounded-full border-pink-200 text-pink-700 hover:bg-pink-50">
                <Link href="/certificate/my">
                  <Award className="mr-2 h-4 w-4" />
                  My Certificates
                </Link>
              </Button>
              <SignOutButton>
                <Button variant="destructive" className="rounded-full bg-rose-500 hover:bg-rose-600">Logout</Button>
              </SignOutButton>
            </div>
          </div>
        </div>

        {/* Stats row - Pastel Colored Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Courses Started",
              value: progressByCourse.length,
              bg: "bg-pink-50/80 border-pink-100",
              icon: "🌍",
              iconBg: "bg-pink-200/50 text-pink-600",
            },
            {
              label: "Lessons Completed",
              value: `${completedLessons}/${totalLessons}`,
              bg: "bg-purple-50/80 border-purple-100",
              icon: "📚",
              iconBg: "bg-purple-200/50 text-purple-600",
            },
            {
              label: "Overall Progress",
              value: `${overallProgress}%`,
              bg: "bg-sky-50/80 border-sky-100",
              icon: "⭐",
              iconBg: "bg-sky-200/50 text-sky-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} backdrop-blur-sm flex items-center gap-4 rounded-3xl border p-5 shadow-sm`}
            >
              <div className={`${stat.iconBg} flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-sm flex-shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500/80">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-2xl font-black text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* No activity */}
        {progressByCourse.length === 0 ? (
          <div className="rounded-[2.5rem] border border-white/60 bg-white/60 p-12 text-center shadow-sm backdrop-blur-md">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-pink-200 to-purple-200 text-4xl shadow-inner">
              🚀
            </div>
            <h2 className="text-2xl font-black text-slate-800">No Activity Yet</h2>
            <p className="mt-3 text-slate-500 font-medium">
              Start a course and complete a lesson to see your progress here!
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-pink-400 to-purple-500 px-8 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-1 hover:shadow-lg"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          /* Course cards */
          <div className="flex flex-col gap-6">
            {progressByCourse.map((course, idx) => {
              const theme = courseColors[idx % courseColors.length];
              return (
                <div
                  key={course.slug}
                  className={`overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 shadow-sm backdrop-blur-sm ring-4 ${theme.ring} ring-opacity-50`}
                >
                  {/* Card header */}
                  <div className="px-6 pt-6 pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black text-slate-800">{course.title}</h2>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                            <BookOpenCheck className="h-4 w-4 text-slate-400" />
                            {course.completedLessons}/{course.totalLessons} lessons done
                          </span>
                          <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                            <Clock3 className="h-4 w-4 text-slate-400" />
                            Last activity: {formatDate(course.lastVisitedAt)}
                          </span>
                        </div>
                      </div>
                      <span className={`rounded-full border px-4 py-2 text-sm font-black shadow-sm ${theme.badge}`}>
                        {course.progressPercent}% complete
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-5 h-4 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${theme.bar}`}
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Lesson list */}
                  <div className="flex flex-col gap-3 px-6 pb-6 mt-2">
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100/50 bg-slate-50/50 px-5 py-4 transition hover:bg-white hover:shadow-md"
                      >
                        {/* Left: title + date */}
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-slate-700">
                            {lesson.title}
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-400">
                            {lesson.lastVisitedAt
                              ? `Visited: ${formatDate(lesson.lastVisitedAt)}`
                              : "Not started yet"}
                          </p>
                        </div>

                        {/* Right: badges + button */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {lesson.quizScorePercent != null && (
                            <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700 border border-purple-200">
                              Quiz: {lesson.quizScorePercent}%
                            </span>
                          )}
                          {lesson.isCompleted ? (
                            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-4 w-4" />
                              Done
                            </span>
                          ) : (
                            <span className="rounded-full bg-pink-100 px-3 py-1.5 text-xs font-bold text-pink-700 border border-pink-200">
                              In Progress
                            </span>
                          )}
                          <Link
                            href={`/courses/${course.slug}/levels/${lesson.levelSlug}/lessons/${lesson.slug}`}
                            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:scale-105"
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}