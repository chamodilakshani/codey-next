import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ArrowLeft, BookOpenCheck, Clock3, PlayCircle, Sparkles } from "lucide-react";

import { LessonLearningFlow } from "@/components/lesson/lesson-learning-flow";
import { getLessonBySlugs, getLevelsByCourseSlug } from "@/lib/course-data";
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

// 🎨 Theme Configuration Map for Levels (Pastel Styles)
type LevelTheme = {
  mainBg: string;
  cardBg: string;
  textAccent: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  playlistActiveBorder: string;
  playlistActiveBg: string;
  themeLabel: string;
  svgElements: React.ReactNode;
};

const LEVEL_THEMES: Record<number, LevelTheme> = {
  // 🌲 Level 1: Forest Theme
  1: {
    mainBg: "bg-gradient-to-b from-[#e0f2fe] via-[#f0fdf4] to-[#dcfce7]",
    cardBg: "bg-white/80 border-emerald-100 shadow-[0_20px_50px_rgba(16,185,129,0.04)]",
    textAccent: "text-emerald-600",
    badgeBg: "bg-emerald-50",
    badgeBorder: "border-emerald-100",
    badgeText: "text-emerald-700",
    playlistActiveBorder: "border-emerald-200",
    playlistActiveBg: "bg-emerald-50/80 text-emerald-900",
    themeLabel: "🌳 Forest Adventure",
    svgElements: (
      <>
        {/* Forest Cloud 1 */}
        <svg className="absolute top-10 left-[8%] w-32 h-auto opacity-40 anim-float" viewBox="0 0 100 60" fill="#ffffff">
          <path d="M20,40 Q10,40 15,30 Q15,15 30,20 Q40,5 55,15 Q70,5 80,20 Q95,20 90,35 Q90,40 80,40 Z" />
        </svg>
        {/* Forest Cloud 2 */}
        <svg className="absolute top-24 right-[5%] w-40 h-auto opacity-30 anim-float" style={{ animationDelay: '2s' }} viewBox="0 0 100 60" fill="#ffffff">
          <path d="M20,40 Q10,40 15,30 Q15,15 30,20 Q40,5 55,15 Q70,5 80,20 Q95,20 90,35 Q90,40 80,40 Z" />
        </svg>
        {/* Floating Leaves */}
        <svg className="absolute bottom-[20%] left-[4%] w-10 h-auto fill-emerald-400/30 anim-sway" viewBox="0 0 24 24">
          <path d="M17,2 C14,2 10,5 9,9 C8,8 6,8 4,10 C2,12 2,15 4,17 C6,19 9,19 11,17 C15,18 19,14 20,10 C21,6 19,2 17,2 Z" />
        </svg>
        {/* Pine Tree Silhouette */}
        <svg className="absolute bottom-4 right-[2%] w-20 h-auto opacity-20 hidden xl:block" viewBox="0 0 100 150">
          <rect x="45" y="100" width="10" height="50" fill="#78350f" />
          <polygon points="50,10 15,60 85,60" fill="#15803d" />
          <polygon points="50,42 22,85 78,85" fill="#166534" />
        </svg>
      </>
    )
  },
  // 🚀 Level 2: Astro Theme
  2: {
    mainBg: "bg-gradient-to-b from-[#e0f2fe] via-[#e0e7ff] to-[#f5f3ff]",
    cardBg: "bg-white/80 border-indigo-100 shadow-[0_20px_50px_rgba(99,102,241,0.04)]",
    textAccent: "text-indigo-600",
    badgeBg: "bg-indigo-50",
    badgeBorder: "border-indigo-100",
    badgeText: "text-indigo-700",
    playlistActiveBorder: "border-indigo-200",
    playlistActiveBg: "bg-indigo-50/80 text-indigo-900",
    themeLabel: "🚀 Astro Orbit",
    svgElements: (
      <>
        {/* Cosmic Space Cloud 1 */}
        <svg className="absolute top-8 left-[12%] w-36 h-auto opacity-50 anim-float" viewBox="0 0 120 70" fill="#ffffff">
          <path d="M25,45 Q12,45 18,32 Q15,15 35,22 Q48,2 65,15 Q82,2 92,22 Q110,22 105,40 Q105,45 92,45 Z" />
        </svg>
        {/* Twinkling Stars */}
        <svg className="absolute top-28 right-[10%] w-6 h-auto fill-indigo-300/60 anim-pulse" viewBox="0 0 24 24">
          <path d="M12,2L14.6,8.6L21.7,9.3L16.3,14L18,21L12,17.3L6,21L7.7,14L2.3,9.3L9.4,8.6L12,2Z" />
        </svg>
        <svg className="absolute bottom-[40%] left-[3%] w-5 h-auto fill-pink-300/50 anim-pulse" style={{ animationDelay: '1s' }} viewBox="0 0 24 24">
          <path d="M12,2L14.6,8.6L21.7,9.3L16.3,14L18,21L12,17.3L6,21L7.7,14L2.3,9.3L9.4,8.6L12,2Z" />
        </svg>
        {/* Pastel Crescent Moon */}
        <svg className="absolute bottom-16 right-[3%] w-14 h-auto opacity-30 fill-amber-300 anim-sway" viewBox="0 0 24 24">
          <path d="M12.3,2A10,10,0,0,0,22,11.7a1,1,0,0,1-1,1H20A9,9,0,1,1,9.3,3.1a1,1,0,0,1,1-1Z" />
        </svg>
      </>
    )
  },
  // 🦖 Level 3: Jurassic Theme
  3: {
    mainBg: "bg-gradient-to-b from-[#fef3c7] via-[#fff7ed] to-[#ffedd5]",
    cardBg: "bg-white/80 border-amber-100 shadow-[0_20px_50px_rgba(245,158,11,0.04)]",
    textAccent: "text-amber-700",
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-100",
    badgeText: "text-amber-800",
    playlistActiveBorder: "border-amber-200",
    playlistActiveBg: "bg-amber-50/80 text-amber-950",
    themeLabel: "🦖 Jurassic Era",
    svgElements: (
      <>
        {/* Prehistoric Dense Cloud */}
        <svg className="absolute top-6 left-[6%] w-44 h-auto opacity-40 anim-float" viewBox="0 0 120 60" fill="#ffffff">
          <path d="M10,40 Q0,40 5,28 Q8,10 28,15 Q40,0 60,10 Q80,0 92,18 Q115,15 110,35 Z" />
        </svg>
        {/* Ancient Clouds 2 */}
        <svg className="absolute top-28 right-[8%] w-32 h-auto opacity-30 anim-float" style={{ animationDelay: '3s' }} viewBox="0 0 100 60" fill="#ffffff">
          <path d="M20,40 Q10,40 15,30 Q35,10 55,20 Q75,5 85,25 Z" />
        </svg>
        {/* Tropical Monstera Leaf Outline */}
        <svg className="absolute bottom-10 left-[2%] w-16 h-auto opacity-20 fill-amber-800/40 anim-sway" viewBox="0 0 24 24">
          <path d="M12,2A10,10,0,0,0,2,12A10,10,0,0,0,12,22A10,10,0,0,0,22,12A10,10,0,0,0,12,2M12,4A1,1,0,0,1,13,5V7A1,1,0,0,1,11,7V5A1,1,0,0,1,12,4M7.5,6.5A1,1,0,0,1,8.5,7.5V9.5A1,1,0,0,1,6.5,9.5V7.5A1,1,0,0,1,7.5,6.5" />
        </svg>
      </>
    )
  },
  // 🌊 Level 4: Deep Sea Theme
  4: {
    mainBg: "bg-gradient-to-b from-[#e0f2fe] via-[#ecfeff] to-[#cffafe]",
    cardBg: "bg-white/80 border-cyan-100 shadow-[0_20px_50px_rgba(6,182,212,0.04)]",
    textAccent: "text-cyan-600",
    badgeBg: "bg-cyan-50",
    badgeBorder: "border-cyan-100",
    badgeText: "text-cyan-700",
    playlistActiveBorder: "border-cyan-200",
    playlistActiveBg: "bg-cyan-50/80 text-cyan-900",
    themeLabel: "🌊 Deep Sea Quest",
    svgElements: (
      <>
        {/* Marine Ocean Cloud 1 */}
        <svg className="absolute top-12 left-[15%] w-36 h-auto opacity-50 anim-float" viewBox="0 0 100 60" fill="#ffffff">
          <path d="M15,35 C30,20 45,45 60,30 C75,15 90,35 100,35 L100,50 L0,50 Z" />
        </svg>
        {/* Sea Bubbles */}
        <circle cx="5%" cy="60%" r="8" className="absolute fill-cyan-300/30 anim-float" style={{ animationDuration: '4s' }} />
        <circle cx="7%" cy="55%" r="4" className="absolute fill-cyan-200/40 anim-float" style={{ animationDuration: '5s' }} />
        <circle cx="94%" cy="30%" r="12" className="absolute fill-cyan-300/20 anim-float" style={{ animationDuration: '6s' }} />
        <circle cx="92%" cy="22%" r="6" className="absolute fill-cyan-200/30 anim-float" style={{ animationDuration: '3s' }} />
      </>
    )
  },
  // 🔮 Level 5: Purple Mix Pink Theme
  5: {
    mainBg: "bg-gradient-to-b from-[#fdf2f8] via-[#fae8ff] to-[#f3e8ff]",
    cardBg: "bg-white/80 border-pink-100 shadow-[0_20px_50px_rgba(236,72,153,0.04)]",
    textAccent: "text-pink-600",
    badgeBg: "bg-pink-50",
    badgeBorder: "border-pink-100",
    badgeText: "text-pink-700",
    playlistActiveBorder: "border-pink-200",
    playlistActiveBg: "bg-pink-50/80 text-pink-900",
    themeLabel: "🔮 Magical Kingdom",
    svgElements: (
      <>
        {/* Dreamy Magical Cloud 1 */}
        <svg className="absolute top-8 left-[5%] w-36 h-auto opacity-50 anim-float" viewBox="0 0 100 60" fill="#ffffff">
          <path d="M20,40 Q5,35 15,20 Q20,5 40,15 Q60,0 75,20 Q95,25 85,45 Z" />
        </svg>
        {/* Dreamy Magical Cloud 2 */}
        <svg className="absolute top-20 right-[12%] w-32 h-auto opacity-40 anim-float" style={{ animationDelay: '1.5s' }} viewBox="0 0 100 60" fill="#ffffff">
          <path d="M20,40 Q10,40 15,30 Q30,10 50,20 Q70,10 80,30 Z" />
        </svg>
        {/* Sparkling Magic Stars */}
        <svg className="absolute bottom-[25%] left-[6%] w-6 h-auto fill-purple-400/40 anim-pulse" viewBox="0 0 24 24">
          <path d="M12,1L14.5,8.5L22,11L14.5,13.5L12,21L9.5,13.5L2,11L9.5,8.5L12,1Z" />
        </svg>
        <svg className="absolute bottom-[15%] right-[4%] w-8 h-auto fill-pink-400/30 anim-sway" viewBox="0 0 24 24">
          <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.41,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.59,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
        </svg>
      </>
    )
  }
};

const DEFAULT_THEME: LevelTheme = {
  mainBg: "bg-slate-50",
  cardBg: "bg-white border-slate-200 shadow-sm",
  textAccent: "text-blue-600",
  badgeBg: "bg-blue-50",
  badgeBorder: "border-blue-100",
  badgeText: "text-blue-700",
  playlistActiveBorder: "border-blue-200",
  playlistActiveBg: "bg-blue-50 text-slate-900",
  themeLabel: "🚀 Learning Quest",
  svgElements: null
};

function resolveGamePath(gameHtmlPath: string | null | undefined) {
  if (!gameHtmlPath) return null;
  const trimmedPath = gameHtmlPath.trim();
  if (!trimmedPath) return null;
  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    return trimmedPath;
  }
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
  if (!lesson) return { title: "Lesson Not Found" };
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

  // 🗺️ Safely deduce the level order number by looking up course levels
  const courseLevels = await getLevelsByCourseSlug(courseSlug);
  const levelOrder = courseLevels.findIndex((l) => l.slug === levelSlug) + 1 || 1;
  const theme = LEVEL_THEMES[levelOrder] || DEFAULT_THEME;

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
    // 🎨 Dynamic Theme Background
    <main className={`relative min-h-full ${theme.mainBg} px-6 py-8 text-slate-800 sm:px-10 overflow-hidden`}>
      
      {/* 🔮 Fluid Inline Keyframe Animations */}
      <style>{`
        @keyframes floatEffect {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(8px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        @keyframes swayEffect {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(8deg) scale(1.05); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .anim-float { animation: floatEffect 6s ease-in-out infinite; }
        .anim-sway { animation: swayEffect 5s ease-in-out infinite; }
      `}</style>

      {/* 🌌 Dynamic SVG Background Theme Elements Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {theme.svgElements}
      </div>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        
        {/* Left Side: Lesson Card */}
        <article className={`rounded-3xl border backdrop-blur-md ${theme.cardBg} p-6 sm:p-8 transition-colors duration-500`}>
          <Link
            href={`/courses/${courseSlug}/levels/${levelSlug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            Back to level
          </Link>

          {/* Dynamic Mission Tagline */}
          <p className={`mt-5 text-xs font-black uppercase tracking-[0.24em] ${theme.textAccent} flex items-center gap-1.5`}>
            <Sparkles className="size-3.5 animate-pulse" /> {theme.themeLabel}
          </p>
          
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {lesson.title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
            {lesson.description}
          </p>

          {/* Lesson Info Badges */}
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className={`inline-flex items-center gap-1 rounded-full border ${theme.badgeBorder} ${theme.badgeBg} px-3 py-1 font-bold ${theme.badgeText} shadow-sm`}>
              <BookOpenCheck className="size-4" />
              Lesson {lesson.displayOrder}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-3 py-1 font-semibold text-slate-600 shadow-sm">
              <Clock3 className="size-4 text-slate-400" />
              {lesson.durationMinutes} mins
            </span>
            <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 font-semibold text-slate-600 shadow-sm">
              {lesson.level.title}
            </span>
          </div>

          {/* Interactive Learning Workflow Component */}
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

        {/* Right Side: Level Playlist Sidebar Card */}
        <aside className={`rounded-3xl border backdrop-blur-md ${theme.cardBg} p-5 sm:p-6 transition-colors duration-500 h-fit`}>
          <p className={`text-xs font-black uppercase tracking-[0.24em] ${theme.textAccent}`}>
            Level Playlist
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            {lesson.level.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">{lesson.level.course.title}</p>

          {/* Playlist Lessons Navigation Grid */}
          <div className="mt-4 space-y-2">
            {playlistLessons.map((item) => {
              const isActive = item.slug === lesson.slug;
              return (
                <Link
                  key={item.id}
                  href={`/courses/${courseSlug}/levels/${levelSlug}/lessons/${item.slug}`}
                  className={[
                    "flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-sm transition-all duration-300",
                    isActive
                      ? `${theme.playlistActiveBorder} ${theme.playlistActiveBg} font-bold shadow-sm scale-[1.01]`
                      : "border-slate-200/60 bg-white/50 text-slate-700 hover:border-slate-300 hover:bg-white",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isActive ? theme.textAccent : "text-slate-400"}`}>
                      Lesson {item.displayOrder}
                    </p>
                    <span className="mt-1 block line-clamp-1 font-semibold text-slate-800">
                      {item.title}
                    </span>
                  </div>
                  <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500 shadow-sm">
                    <PlayCircle className="size-3.5 text-slate-400" />
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