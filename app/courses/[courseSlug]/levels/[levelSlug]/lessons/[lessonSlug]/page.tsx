import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ArrowLeft, BookOpenCheck, Clock3, PlayCircle } from "lucide-react";

import { LessonLearningFlow } from "@/components/lesson/lesson-learning-flow";
import { getLessonBySlugs } from "@/lib/course-data";
import { getRoleFromSessionClaims, parseLessonActivityMap } from "@/lib/clerk-role";

type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

type LessonPageProps = {
  params: Promise<{ courseSlug: string; levelSlug: string; lessonSlug: string }>;
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

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { courseSlug, levelSlug, lessonSlug } = await params;
  const lesson = await getLessonBySlugs(courseSlug, levelSlug, lessonSlug);

  if (!lesson) {
    return { title: "Lesson Not Found" };
  }

  return {
    title: `${lesson.title} | ${lesson.level.course.title}`,
    description: lesson.description,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, levelSlug, lessonSlug } = await params;
  const lesson = await getLessonBySlugs(courseSlug, levelSlug, lessonSlug);
  const { userId, sessionClaims } = await auth();
  const role = getRoleFromSessionClaims(sessionClaims);
  const isSignedIn = Boolean(userId);
  const isLearner = isSignedIn && role === "learner";
  const isAdmin = isSignedIn && role === "admin";

  if (
    !lesson ||
    !lesson.level.course.isPublished ||
    lesson.level.slug !== levelSlug ||
    (lesson.level.course.isLocked && !isAdmin)
  ) {
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

  const playlistLessons = lesson.level.lessons;

  return (
    <main className="min-h-full bg-slate-50 px-6 py-8 text-slate-800 sm:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Link
            href={`/courses/${courseSlug}/levels/${levelSlug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            Back to level
          </Link>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
            Course
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {lesson.title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
            {lesson.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 font-semibold text-blue-700">
              <BookOpenCheck className="size-4" />
              Lesson {lesson.displayOrder}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-medium text-slate-600">
              <Clock3 className="size-4" />
              {lesson.durationMinutes} mins
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-medium text-slate-600">
              {lesson.level.title}
            </span>
          </div>

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

        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
            Level Playlist
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            {lesson.level.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{lesson.level.course.title}</p>

          <div className="mt-4 space-y-2">
            {playlistLessons.map((item) => {
              const isActive = item.slug === lesson.slug;
              return (
                <Link
                  key={item.id}
                  href={`/courses/${courseSlug}/levels/${levelSlug}/lessons/${item.slug}`}
                  className={[
                    "flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-sm transition",
                    isActive
                      ? "border-blue-200 bg-blue-50 text-slate-900 shadow-sm"
                      : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-white",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Lesson {item.displayOrder}
                    </p>
                    <span className="mt-1 block line-clamp-1 font-semibold">
                      {item.title}
                    </span>
                  </div>
                  <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
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
