import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { BookOpenCheck, CheckCircle2, Clock3, Award } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRoleFromUser, parseLessonActivityMap } from "@/lib/clerk-role";
import prisma from "@/lib/prisma";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";

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

// Light pastel color themes per course index — matches home page
const courseColors = [
  { bar: "bg-gradient-to-r from-green-400 to-emerald-500", badge: "bg-green-100 text-green-700 border-green-200", ring: "ring-green-200" },
  { bar: "bg-gradient-to-r from-sky-400 to-blue-500",      badge: "bg-sky-100 text-sky-700 border-sky-200",     ring: "ring-sky-200"   },
  { bar: "bg-gradient-to-r from-amber-400 to-orange-500",  badge: "bg-amber-100 text-amber-700 border-amber-200", ring: "ring-amber-200" },
  { bar: "bg-gradient-to-r from-cyan-400 to-teal-500",     badge: "bg-cyan-100 text-cyan-700 border-cyan-200",  ring: "ring-cyan-200"  },
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
      <main className="min-h-full bg-gradient-to-b from-sky-50 via-white to-blue-50 px-6 py-10 sm:px-10">
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Profile</h1>
            </div>
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Go To Dashboard
            </Link>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
              <Trophy className="h-8 w-8 text-violet-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Admin Account</h2>
            <p className="mt-2 text-sm text-slate-500">
              Learner progress is tracked only for users with the{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">learner</code>{" "}
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
    const lessons = course.levels.flatMap((level) => level.lessons);
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
    <main className="min-h-full bg-gradient-to-b from-sky-50 via-white to-blue-50 px-6 py-10 sm:px-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar bubble */}
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={userName} 
                className="h-14 w-14 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-400 text-2xl shadow-md">
                🧑‍💻
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Welcome, {userName}!
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Track your lessons, quizzes, and adventure progress!
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:-translate-y-0.5"
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
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/certificate/my">
                <Award className="mr-2 h-4 w-4" />
                My Certificates
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back To Courses</Link>
            </Button>
            <SignOutButton>
              <Button variant="destructive">Logout</Button>
            </SignOutButton>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Courses Started",
              value: progressByCourse.length,
              bg: "bg-sky-50",
              icon: "🌍",
              iconBg: "bg-sky-100",
            },
            {
              label: "Lessons Completed",
              value: `${completedLessons}/${totalLessons}`,
              bg: "bg-emerald-50",
              icon: "📚",
              iconBg: "bg-emerald-100",
            },
            {
              label: "Overall Progress",
              value: `${overallProgress}%`,
              bg: "bg-amber-50",
              icon: "⭐",
              iconBg: "bg-amber-100",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} flex items-center gap-4 rounded-2xl border border-slate-200 p-5 shadow-sm`}
            >
              <div className={`${stat.iconBg} flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm flex-shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* No activity */}
        {progressByCourse.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
              🏆
            </div>
            <h2 className="text-2xl font-black text-slate-900">No Activity Yet</h2>
            <p className="mt-3 text-slate-500">
              Start a course and complete a lesson to see your progress here!
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-orange-400 to-pink-400 px-7 py-3 text-sm font-extrabold text-white shadow transition hover:-translate-y-0.5 hover:shadow-md"
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
                  className={`overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm ring-2 ${theme.ring}`}
                >
                  {/* Card header */}
                  <div className="px-6 pt-6 pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black text-slate-900">{course.title}</h2>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <BookOpenCheck className="h-3.5 w-3.5" />
                            {course.completedLessons}/{course.totalLessons} lessons done
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            Last activity: {formatDate(course.lastVisitedAt)}
                          </span>
                        </div>
                      </div>
                      <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${theme.badge}`}>
                        {course.progressPercent}% complete
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${theme.bar}`}
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Lesson list */}
                  <div className="flex flex-col gap-2 px-6 pb-6">
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:bg-white hover:shadow-sm"
                      >
                        {/* Left: title + date */}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {lesson.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {lesson.lastVisitedAt
                              ? `Visited: ${formatDate(lesson.lastVisitedAt)}`
                              : "Not started yet"}
                          </p>
                        </div>

                        {/* Right: badges + button */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {lesson.quizScorePercent != null && (
                            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 border border-violet-200">
                              Quiz: {lesson.quizScorePercent}%
                            </span>
                          )}
                          {lesson.isCompleted ? (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Done
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                              In Progress
                            </span>
                          )}
                          <Link
                            href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
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