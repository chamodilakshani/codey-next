import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenCheck, Clock3, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getCourseBySlug,
  getLevelsByCourseSlug,
  getAgeGroupLabel,
  getDifficultyLabel,
} from "@/lib/course-data";

type LevelPageProps = {
  params: Promise<{ courseSlug: string; levelSlug: string }>;
};

export async function generateMetadata({ params }: LevelPageProps): Promise<Metadata> {
  const { courseSlug, levelSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  const levels = await getLevelsByCourseSlug(courseSlug);
  const level = levels.find((item) => item.slug === levelSlug);

  if (!course || !level) {
    return {
      title: "Level Not Found",
    };
  }

  return {
    title: `${level.title} | ${course.title}`,
    description: `Level ${level.displayOrder} for ${course.title}`,
  };
}

export default async function LevelPage({ params }: LevelPageProps) {
  const { courseSlug, levelSlug } = await params;
  const course = await getCourseBySlug(courseSlug);

  if (!course || !course.isPublished) {
    notFound();
  }

  const levels = await getLevelsByCourseSlug(courseSlug);
  const courseWithLevels = { ...course, levels };
  const level = courseWithLevels.levels.find((item) => item.slug === levelSlug);

  if (!level) {
    notFound();
  }

  const lessonCount = level.lessons.length;
  const firstLesson = level.lessons[0] ?? null;

  return (
    <main className="min-h-full bg-background px-6 py-8 sm:px-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="mb-3 text-sm font-semibold text-primary">{course.title}</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{level.title}</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            {lessonCount} lessons in this level.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground">
              <BookOpenCheck className="size-4" />
              {lessonCount} lessons
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
              <Link href={`/courses/${course.slug}/levels/${level.slug}/lessons/${firstLesson.slug}`}>
                Start Level {level.displayOrder}
              </Link>
            </Button>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              No lessons in this level yet. Check back soon.
            </p>
          )}
        </div>

        <section className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Lessons in {level.title}</h2>
              <p className="text-sm text-muted-foreground">Choose a lesson to continue your adventure.</p>
            </div>
            <Link
              href={`/courses/${course.slug}`}
              className="text-sm font-semibold text-primary hover:text-primary/80"
            >
              Back to course
            </Link>
          </div>

          {level.lessons.length > 0 ? (
            level.lessons.map((lesson) => (
              <article key={lesson.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Lesson {lesson.displayOrder}</p>
                    <h3 className="text-lg font-semibold">{lesson.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{lesson.durationMinutes} mins</span>
                    <Button asChild variant="outline">
                      <Link href={`/courses/${course.slug}/levels/${level.slug}/lessons/${lesson.slug}`}>
                        <PlayCircle className="mr-1 size-4" />
                        Play
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No lessons are available in this level yet.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}
