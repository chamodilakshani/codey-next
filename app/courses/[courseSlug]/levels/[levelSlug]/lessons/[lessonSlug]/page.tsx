import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ArrowLeft, PlayCircle, BookOpen, Gamepad2, CheckCircle2, Leaf } from "lucide-react";

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

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { courseSlug, levelSlug, lessonSlug } = await params;
  const lesson = await getLessonBySlugs(courseSlug, lessonSlug, levelSlug);
  if (!lesson) return { title: "Lesson Not Found" };
  return {
    title: `${lesson.title} | ${lesson.course.title}`,
    description: lesson.description,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, levelSlug, lessonSlug } = await params;
  const lesson = await getLessonBySlugs(courseSlug, lessonSlug, levelSlug);

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
        <article className="overflow-hidden rounded-[2rem] border-2 border-green-200 bg-white/90 shadow-xl shadow-green-200/40 backdrop-blur-sm">
          <div className="relative h-3 w-full overflow-hidden bg-gradient-to-r from-green-600 via-emerald-500 to-lime-500">
            <div className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,255,255,0.25) 18px, rgba(255,255,255,0.25) 20px)",
              }}
            />
          </div>

          <div className="p-6 sm:p-8">
            <Link
              href={`/courses/${courseSlug}/levels/${levelSlug}`}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to level
            </Link>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-800">
              <Leaf className="h-3.5 w-3.5" />
              Level {lesson.level?.displayOrder ?? "?"} • Quest {currentIndex + 1} of {totalLessons}
            </div>

            <h1 className="text-2xl font-black tracking-tight text-green-950 sm:text-3xl">
              {lesson.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-green-800/70">
              {lesson.description}
            </p>

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

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300 to-transparent" />
              <span className="text-green-400 text-lg">🌿</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300 to-transparent" />
            </div>

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

        <aside className="flex flex-col gap-4">
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

            <div className="mb-1 flex items-center justify-between text-xs font-bold text-green-700">
              <span>Trail progress</span>
              <span>{currentIndex + 1}/{totalLessons} quests</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-green-100 border border-green-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-400 to-lime-400 transition-all duration-500 relative overflow-hidden"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
            <p className="mt-1.5 text-right text-xs font-bold text-emerald-600">
              {progressPercent}% explored 🗺️
            </p>
          </div>

          <div className="rounded-[1.75rem] border-2 border-green-200 bg-white/90 p-5 shadow-lg shadow-green-100/50 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">🗺️</span>
              <p className="text-xs font-black uppercase tracking-widest text-green-600">
                Trail Map
              </p>
            </div>

            <div className="relative flex flex-col gap-1.5">
              <div className="absolute left-[1.1rem] top-3 bottom-3 w-0.5 bg-gradient-to-b from-green-400 via-green-200 to-green-100 rounded-full" />

              {lesson.course.lessons.map((item, index) => {
                const isActive = item.slug === lessonSlug;
                const isPast = index < currentIndex;
                return (
                  <div key={item.id} className="relative flex items-start gap-3 pl-8">
                    <span
                      className={`mt-1 h-3.5 w-3.5 rounded-full border-2 ${
                        isActive
                          ? "border-emerald-600 bg-emerald-500"
                          : isPast
                          ? "border-emerald-400 bg-emerald-200"
                          : "border-slate-200 bg-white"
                      }`}
                    />
                    <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold">{item.title}</p>
                        <span className="text-xs text-slate-500">{item.durationMinutes}m</span>
                      </div>
                      <Link
                        href={`/courses/${courseSlug}/levels/${levelSlug}/lessons/${item.slug}`}
                        className="mt-2 inline-block text-sm font-semibold text-primary hover:text-primary/80"
                      >
                        View lesson
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
