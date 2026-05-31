import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { BookOpenCheck, CheckCircle2, Clock3, Award } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRoleFromUser, parseLessonActivityMap } from "@/lib/clerk-role";
import prisma from "@/lib/prisma";

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
  if (!value) {
    return "No activity yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No activity yet";
  }

  return date.toLocaleString();
}

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = getRoleFromUser(user);

  if (role === "admin") {
    return (
      <main className="min-h-full bg-background px-6 py-10 sm:px-10">
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go To Dashboard</Link>
            </Button>
          </div>
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Admin Account</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Learner progress is tracked only for users with the `learner` role.
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  const activityMap = parseLessonActivityMap(user.privateMetadata?.lessonActivity);
  const activityEntries = Object.values(activityMap);
  const trackedCourseSlugs = Array.from(
    new Set(activityEntries.map((entry) => entry.courseSlug).filter((slug) => slug.length > 0))
  );

  const courses = await prisma.course.findMany({
    where: {
      slug: {
        in: trackedCourseSlugs.length > 0 ? trackedCourseSlugs : ["__none__"],
      },
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
    orderBy: {
      title: "asc",
    },
  });

  const progressByCourse: CourseProgress[] = courses.map((course) => {
    const lessons = course.levels.flatMap((level) => level.lessons);
    const entriesForCourse = activityEntries.filter((entry) => entry.courseSlug === course.slug);
    const completedLessonIds = new Set(
      entriesForCourse
        .filter((entry) => Boolean(entry.videoCompletedAt))
        .map((entry) => entry.lessonId)
    );

    const completedLessons = lessons.filter((lesson) =>
      completedLessonIds.has(lesson.id)
    ).length;
    const totalLessons = lessons.length;
    const progressPercent =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const lastVisitedAt =
      entriesForCourse
        .map((entry) => entry.lastVisitedAt ?? null)
        .filter((value): value is string => Boolean(value))
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

    const lessonEntryById = new Map(entriesForCourse.map((entry) => [entry.lessonId, entry]));

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

  const totalLessons = progressByCourse.reduce((sum, item) => sum + item.totalLessons, 0);
  const completedLessons = progressByCourse.reduce(
    (sum, item) => sum + item.completedLessons,
    0
  );
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <main className="min-h-full bg-background px-6 py-10 sm:px-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Learning Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track lesson completion and quiz performance.
            </p>
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

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Courses Started</p>
              <p className="mt-1 text-2xl font-semibold">{progressByCourse.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Lessons Completed</p>
              <p className="mt-1 text-2xl font-semibold">
                {completedLessons}/{totalLessons}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Overall Progress</p>
              <p className="mt-1 text-2xl font-semibold">{overallProgress}%</p>
            </CardContent>
          </Card>
        </div>

        {progressByCourse.length === 0 ? (
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>No Activity Yet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Start a course and complete a lesson video to see your progress here.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {progressByCourse.map((course) => (
              <Card key={course.slug} className="rounded-3xl">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle>{course.title}</CardTitle>
                    <Badge variant="outline">{course.progressPercent}% complete</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <BookOpenCheck className="size-3.5" />
                      {course.completedLessons}/{course.totalLessons} lessons done
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      Last activity: {formatDate(course.lastVisitedAt)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {course.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.lastVisitedAt
                            ? `Visited: ${formatDate(lesson.lastVisitedAt)}`
                            : "Not started"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.quizScorePercent != null ? (
                          <Badge variant="outline">Quiz: {lesson.quizScorePercent}%</Badge>
                        ) : null}
                        {lesson.isCompleted ? (
                          <Badge>
                            <CheckCircle2 className="size-3.5" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline">In Progress</Badge>
                        )}
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/courses/${course.slug}/lessons/${lesson.slug}`}>
                            Open
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
