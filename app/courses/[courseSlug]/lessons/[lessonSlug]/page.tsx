import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ArrowLeft, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LessonLearningFlow } from "@/components/lesson/lesson-learning-flow";
import { getLessonBySlugs } from "@/lib/course-data";
import { getRoleFromSessionClaims, parseLessonActivityMap } from "@/lib/clerk-role";

type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

function resolveGamePath(gameHtmlPath: string | null | undefined) {
  if (!gameHtmlPath) {
    return null;
  }

  const trimmedPath = gameHtmlPath.trim();
  if (!trimmedPath) {
    return null;
  }

  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    return trimmedPath;
  }

  return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
}

function normalizeQuizQuestions(value: unknown): QuizQuestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: Array<QuizQuestion | null> = value.map((item) => {
    if (!item || typeof item !== "object") {
      return null;
    }

    const candidate = item as {
      question?: unknown;
      options?: unknown;
      answerIndex?: unknown;
      explanation?: unknown;
    };

    if (typeof candidate.question !== "string" || !Array.isArray(candidate.options)) {
      return null;
    }

    const options = candidate.options.map((option) => String(option));
    const answerIndex = Number(candidate.answerIndex);

    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
      return null;
    }

    return {
      question: candidate.question,
      options,
      answerIndex,
      explanation: typeof candidate.explanation === "string" ? candidate.explanation : undefined,
    } satisfies QuizQuestion;
  });

  return normalized.filter((item): item is QuizQuestion => item !== null);
}

type LessonPageProps = {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
};

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const lesson = await getLessonBySlugs(courseSlug, lessonSlug);

  if (!lesson) {
    return { title: "Lesson Not Found" };
  }

  return {
    title: `${lesson.title} | ${lesson.level.course.title}`,
    description: lesson.description,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const lesson = await getLessonBySlugs(courseSlug, lessonSlug);

  if (!lesson || !lesson.level.course.isPublished) {
    notFound();
  }

  const quizQuestions = normalizeQuizQuestions(lesson.quiz?.questions);
  const gamePath = resolveGamePath(lesson.gameHtmlPath);
  const { userId, sessionClaims } = await auth();
  const role = getRoleFromSessionClaims(sessionClaims);
  const isSignedIn = Boolean(userId);
  const isLearner = isSignedIn && role === "learner";

  let initialVideoCompleted = false;
  let initialGamePlayed = false;

  if (isLearner && userId) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const activityMap = parseLessonActivityMap(user.privateMetadata?.lessonActivity);
    const activity = activityMap[lesson.id];
    initialVideoCompleted = Boolean(activity?.videoCompletedAt);
    initialGamePlayed = Boolean(activity?.gamePlayedAt);
  }

  const playlistLessons = lesson.level.course.levels.flatMap((level) => level.lessons);

  return (
    <main className="min-h-full bg-background px-6 py-8 sm:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <Button asChild variant="ghost" className="mb-4 px-0">
            <Link href={`/courses/${courseSlug}`}>
              <ArrowLeft className="mr-2 size-4" />
              Back to course
            </Link>
          </Button>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{lesson.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{lesson.description}</p>

          <LessonLearningFlow
            lessonId={lesson.id}
            courseSlug={courseSlug}
            lessonSlug={lessonSlug}
            lessonTitle={lesson.title}
            videoUrl={lesson.videoUrl}
            gamePath={gamePath}
            quizId={lesson.quiz?.id ?? null}
            quizTitle={lesson.quiz?.title ?? null}
            quizQuestions={quizQuestions}
            isSignedIn={isSignedIn}
            isLearner={isLearner}
            initialVideoCompleted={initialVideoCompleted}
            initialGamePlayed={initialGamePlayed}
          />
        </article>

        <aside className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-primary">Playlist</p>
          <h2 className="mt-1 text-lg font-semibold">{lesson.level.course.title}</h2>

          <div className="mt-4 space-y-2">
            {playlistLessons.map((item) => {
              const isActive = item.slug === lesson.slug;

              return (
                <Link
                  key={item.id}
                  href={`/courses/${courseSlug}/lessons/${item.slug}`}
                  className={[
                    "flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition",
                    isActive
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:bg-muted",
                  ].join(" ")}
                >
                  <span className="line-clamp-1">{item.title}</span>
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <PlayCircle className="size-3.5" />
                    {item.durationMinutes}m
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>
      </section>
    </main>
  );
}
