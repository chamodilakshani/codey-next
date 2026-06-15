import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ArrowLeft, PlayCircle, Sparkles } from "lucide-react";

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
  const { userId, sessionClaims } = await auth();
  const role = getRoleFromSessionClaims(sessionClaims);
  const isSignedIn = Boolean(userId);
  const isLearner = isSignedIn && role === "learner";
  const isAdmin = isSignedIn && role === "admin";

  if (!lesson || !lesson.level.course.isPublished || (lesson.level.course.isLocked && !isAdmin)) {
    notFound();
  }

  const quizQuestions = normalizeQuizQuestions(lesson.quiz?.questions);
  const gamePath = resolveGamePath(lesson.gameHtmlPath);

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
    <main className="min-h-full bg-gradient-to-br from-sky-50 via-amber-50 to-pink-50 px-6 py-8 sm:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="relative rounded-[2rem] border-4 border-dashed border-pink-200 bg-white p-5 shadow-lg shadow-pink-100 sm:p-7">
          <Sparkles className="absolute right-5 top-5 size-6 text-amber-300" aria-hidden="true" />

          <Button
            asChild
            variant="ghost"
            className="mb-4 rounded-full border-2 border-sky-200 bg-sky-50 px-4 text-sky-700 hover:bg-sky-100 hover:text-sky-800"
          >
            <Link href={`/courses/${courseSlug}`}>
              <ArrowLeft className="mr-2 size-4" />
              Back to course
            </Link>
          </Button>

          <h1 className="text-2xl font-extrabold tracking-tight text-purple-600 sm:text-3xl">
            {lesson.title}
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">{lesson.description}</p>

          <div className="mt-6">
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
          </div>
        </article>

        <aside className="rounded-[2rem] border-4 border-dashed border-sky-200 bg-white p-5 shadow-lg shadow-sky-100 sm:p-6">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
            🎈 Playlist
          </span>
          <h2 className="mt-2 text-lg font-extrabold text-sky-700">{lesson.level.course.title}</h2>

          <div className="mt-4 space-y-2">
            {playlistLessons.map((item) => {
              const isActive = item.slug === lesson.slug;

              return (
                <Link
                  key={item.id}
                  href={`/courses/${courseSlug}/lessons/${item.slug}`}
                  className={[
                    "flex items-center justify-between rounded-2xl border-2 px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                    isActive
                      ? "border-pink-300 bg-pink-50 text-pink-700 shadow-sm"
                      : "border-slate-100 text-slate-600 hover:scale-[1.02] hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700",
                  ].join(" ")}
                >
                  <span className="line-clamp-1">{item.title}</span>
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-600">
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