import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ArrowLeft, PlayCircle, BookOpen, Gamepad2, CheckCircle2, Leaf } from "lucide-react";

import { LessonLearningFlow } from "@/components/lesson/lesson-learning-flow";
import { getLessonBySlugs } from "@/lib/course-data";
import {
  getRoleFromSessionClaims,
  parseLessonActivityMap,
} from "@/lib/clerk-role";

type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

function resolveGamePath(gameHtmlPath: string | null | undefined) {
  if (!gameHtmlPath) return null;
  const trimmedPath = gameHtmlPath.trim();
  if (!trimmedPath) return null;
  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) return trimmedPath;
  return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
}

function normalizeQuizQuestions(value: unknown): QuizQuestion[] {
  if (!Array.isArray(value)) return [];
  const normalized: Array<QuizQuestion | null> = value.map((item) => {
    if (!item || typeof item !== "object") return null;
    const candidate = item as {
      question?: unknown;
      options?: unknown;
      answerIndex?: unknown;
      explanation?: unknown;
    };
    if (typeof candidate.question !== "string" || !Array.isArray(candidate.options)) return null;
    const options = candidate.options.map((o) => String(o));
    const answerIndex = Number(candidate.answerIndex);
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) return null;
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
  if (!lesson) return { title: "Lesson Not Found" };
  return {
    title: `${lesson.title} | ${lesson.course.title}`,
    description: lesson.description,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const lesson = await getLessonBySlugs(courseSlug, lessonSlug);

  if (!lesson || !lesson.course.isPublished) notFound();

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

  const currentIndex = lesson.course.lessons.findIndex((l) => l.slug === lessonSlug);
  const totalLessons = lesson.course.lessons.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalLessons) * 100);

  return (
    <main
      className="min-h-full px-4 py-8 sm:px-8"
      style={{
        background:
          "radial-gradient(ellipse at top left, #bbf7d0 0%, #d1fae5 25%, #f0fdf4 60%, #dcfce7 100%)",
      }}
    >
      {/* Decorative floating leaves — pure CSS, no images needed */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[5%]  top-[8%]  h-10 w-10 rotate-[20deg]  rounded-full bg-green-300/40 blur-sm" />
        <div className="absolute left-[18%] top-[35%] h-6  w-6  rotate-[-15deg] rounded-full bg-emerald-400/30 blur-sm" />
        <div className="absolute left-[2%]  top-[60%] h-14 w-14 rotate-[35deg]  rounded-full bg-green-200/50 blur-md" />
        <div className="absolute right-[4%]  top-[12%] h-12 w-12 rotate-[-25deg] rounded-full bg-lime-300/40 blur-sm" />
        <div className="absolute right-[15%] top-[50%] h-8  w-8  rotate-[10deg]  rounded-full bg-emerald-300/35 blur-sm" />
        <div className="absolute right-[6%]  top-[75%] h-16 w-16 rotate-[-40deg] rounded-full bg-green-200/45 blur-md" />
        <div className="absolute left-[45%] top-[5%]  h-7  w-7  rotate-[55deg]  rounded-full bg-lime-400/30 blur-sm" />
        <div className="absolute left-[70%] top-[88%] h-10 w-10 rotate-[-30deg] rounded-full bg-emerald-200/40 blur-sm" />
      </div>

      <section className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[2fr_1fr]">

        {/* ══════════════ MAIN LESSON CARD ══════════════ */}
        <article className="overflow-hidden rounded-[2rem] border-2 border-green-200 bg-white/90 shadow-xl shadow-green-200/40 backdrop-blur-sm">

          {/* Forest canopy top bar */}
          <div className="relative h-3 w-full overflow-hidden bg-gradient-to-r from-green-600 via-emerald-500 to-lime-500">
            <div className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,255,255,0.25) 18px, rgba(255,255,255,0.25) 20px)",
              }}
            />
          </div>

          <div className="p-6 sm:p-8">

            {/* Back link */}
            <Link
              href={`/courses/${courseSlug}`}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to forest trail
            </Link>

            {/* Lesson number pill */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-800">
              <Leaf className="h-3.5 w-3.5" />
              Quest {currentIndex + 1} of {totalLessons}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-black tracking-tight text-green-950 sm:text-3xl">
              {lesson.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-green-800/70">
              {lesson.description}
            </p>

            {/* Feature badge pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-700 border border-sky-200">
                <PlayCircle className="h-3.5 w-3.5" />
                Video Lesson
              </span>
              {gamePath && (
                <span className="flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1.5 text-xs font-bold text-lime-700 border border-lime-200">
                  <Gamepad2 className="h-3.5 w-3.5" />
                  Mini Game
                </span>
              )}
              {quizQuestions.length > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200">
                  <BookOpen className="h-3.5 w-3.5" />
                  {quizQuestions.length} Quiz Questions
                </span>
              )}
              {initialVideoCompleted && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Quest Complete!
                </span>
              )}
            </div>

            {/* Mossy divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300 to-transparent" />
              <span className="text-green-400 text-lg">🌿</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300 to-transparent" />
            </div>

            {/* Learning flow */}
            <LessonLearningFlow
              lessonId={lesson.id}
              courseSlug={courseSlug}
              lessonSlug={lessonSlug}
              lessonTitle={lesson.title}
              videoUrl={lesson.videoUrl}
              gamePath={gamePath}
              quizTitle={lesson.quiz?.title ?? null}
              quizQuestions={quizQuestions}
              isSignedIn={isSignedIn}
              isLearner={isLearner}
              initialVideoCompleted={initialVideoCompleted}
              initialGamePlayed={initialGamePlayed}
            />
          </div>
        </article>

        {/* ══════════════ SIDEBAR ══════════════ */}
        <aside className="flex flex-col gap-4">

          {/* Course info + progress */}
          <div className="rounded-[1.75rem] border-2 border-green-200 bg-white/90 p-5 shadow-lg shadow-green-100/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-xl shadow-md">
                🌲
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-green-500">
                  Forest Adventure
                </p>
                <h2 className="truncate text-sm font-black text-green-950">
                  {lesson.course.title}
                </h2>
              </div>
            </div>

            {/* Progress bar — earthy trail style */}
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-green-700">
              <span>Trail progress</span>
              <span>{currentIndex + 1}/{totalLessons} quests</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-green-100 border border-green-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-400 to-lime-400 transition-all duration-500 relative overflow-hidden"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
            <p className="mt-1.5 text-right text-xs font-bold text-emerald-600">
              {progressPercent}% explored 🗺️
            </p>
          </div>

          {/* Playlist — styled as a trail map */}
          <div className="rounded-[1.75rem] border-2 border-green-200 bg-white/90 p-5 shadow-lg shadow-green-100/50 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">🗺️</span>
              <p className="text-xs font-black uppercase tracking-widest text-green-600">
                Trail Map
              </p>
            </div>

            <div className="relative flex flex-col gap-1.5">
              {/* Vertical trail line */}
              <div className="absolute left-[1.1rem] top-3 bottom-3 w-0.5 bg-gradient-to-b from-green-400 via-green-200 to-green-100 rounded-full" />

              {lesson.course.lessons.map((item, index) => {
                const isActive = item.slug === lessonSlug;
                const isPast = index < currentIndex;

                return (
                  <Link
                    key={item.id}
                    href={`/courses/${courseSlug}/lessons/${item.slug}`}
                    className={[
                      "relative flex items-center justify-between rounded-xl px-3 py-2.5 pl-10 text-sm transition",
                      isActive
                        ? "bg-gradient-to-r from-green-100 to-emerald-50 border-2 border-green-400 shadow-sm"
                        : isPast
                        ? "bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-50 border border-slate-100 hover:bg-green-50",
                    ].join(" ")}
                  >
                    {/* Trail marker dot */}
                    <div
                      className={[
                        "absolute left-2.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-black border-2",
                        isActive
                          ? "bg-green-500 border-green-600 text-white shadow-md"
                          : isPast
                          ? "bg-emerald-400 border-emerald-500 text-white"
                          : "bg-white border-slate-300 text-slate-400",
                      ].join(" ")}
                    >
                      {isPast ? "✓" : index + 1}
                    </div>

                    {/* Title */}
                    <span
                      className={[
                        "line-clamp-1 text-xs font-bold",
                        isActive ? "text-green-800" : isPast ? "text-emerald-700" : "text-slate-500",
                      ].join(" ")}
                    >
                      {item.title}
                    </span>

                    {/* Duration */}
                    <span className="ml-2 flex flex-shrink-0 items-center gap-1 text-xs text-green-400 font-semibold">
                      <PlayCircle className="h-3 w-3" />
                      {item.durationMinutes}m
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Forest tip card */}
          <div className="rounded-[1.75rem] border-2 border-lime-200 bg-lime-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🦉</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-lime-700 mb-1">
                  Wise Owl Says
                </p>
                <p className="text-xs leading-relaxed text-lime-800">
                  Complete the video, play the mini game, and finish the quiz to earn your forest badge and XP! 🏅
                </p>
              </div>
            </div>
          </div>

          {/* XP earned indicator (if completed) */}
          {initialVideoCompleted && (
            <div className="rounded-[1.75rem] border-2 border-emerald-300 bg-gradient-to-br from-emerald-100 to-green-50 p-5 shadow-sm text-center">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-sm font-black text-emerald-800">Quest Complete!</p>
              <p className="text-xs text-emerald-600 mt-1">You earned XP for this lesson</p>
            </div>
          )}

        </aside>
      </section>
    </main>
  );
}