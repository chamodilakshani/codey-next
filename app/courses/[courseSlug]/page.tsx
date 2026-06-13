import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BookOpenCheck, Clock3, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getAgeGroupLabel,
  getCourseBySlug,
  getDifficultyLabel,
  getLevelsByCourseSlug,
} from "@/lib/course-data";
import { getRoleFromSessionClaims } from "@/lib/clerk-role";

type CoursePageProps = {
  params: Promise<{ courseSlug: string }>;
};

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await getCourseBySlug(courseSlug);

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return {
    title: `${course.title} | Codey Kids`,
    description: course.shortDescription,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  const levels = await getLevelsByCourseSlug(courseSlug);
  const { userId, sessionClaims } = await auth();
  const isAdmin = Boolean(userId) && getRoleFromSessionClaims(sessionClaims) === "admin";

  if (!course || !course.isPublished || (course.isLocked && !isAdmin)) {
    notFound();
  }

  const courseWithLevels = { ...course, levels };
  const levelLessons = courseWithLevels.levels.flatMap((level) => level.lessons);
  const totalLessons = levelLessons.length || courseWithLevels.lessons.length;
  const firstLevel = courseWithLevels.levels[0] ?? null;
  const firstLesson = firstLevel?.lessons[0] ?? courseWithLevels.lessons[0] ?? null;

  return (
    <main className="min-h-full bg-background px-6 py-8 sm:px-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="mb-3 text-sm font-semibold text-primary">Course</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">{course.description}</p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground">
              <BookOpenCheck className="size-4" />
              {totalLessons} lessons
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
              <Clock3 className="size-4" />
              {course.durationMinutes} mins
            </span>
            <span className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
              {getAgeGroupLabel(course.ageGroup)}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
              {getDifficultyLabel(course.difficulty)}
            </span>
          </div>

          {firstLesson ? (
            <Button asChild className="mt-6">
              <Link
                href={
                  firstLevel
                    ? `/courses/${course.slug}/levels/${firstLevel.slug}/lessons/${firstLesson.slug}`
                    : `/courses/${course.slug}/lessons/${firstLesson.slug}`
                }
              >
                Start First Lesson
              </Link>
            </Button>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Lessons for this course are being prepared. Check back soon.
            </p>
          )}
        </div>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold">Levels & Lessons</h2>

          {course.levels.length > 0 ? (
            course.levels.map((level) => (
              <div key={level.id} className="grid gap-3">
                <h3 className="text-lg font-semibold">{level.title}</h3>
                {level.lessons.map((lesson) => (
                  <article
                    key={lesson.id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Lesson {lesson.displayOrder}</p>
                        <h4 className="text-lg font-semibold">{lesson.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {lesson.durationMinutes} mins
                        </span>
                        <Button asChild variant="outline">
                          <Link href={`/courses/${course.slug}/levels/${level.slug}/lessons/${lesson.slug}`}>
                            <PlayCircle className="mr-1 size-4" />
                            Watch
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No levels or lessons available for this course yet.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}
