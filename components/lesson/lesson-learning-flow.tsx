"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SignInButton } from "@clerk/nextjs";

import { LessonQuiz } from "@/components/lesson/lesson-quiz";
import { Button } from "@/components/ui/button";

type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

type LessonLearningFlowProps = {
  lessonId: string;
  courseSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  videoUrl: string;
  gamePath: string | null;
  quizId: string | null;
  quizTitle: string | null;
  quizQuestions: QuizQuestion[];
  isSignedIn: boolean;
  isLearner: boolean;
  initialVideoCompleted: boolean;
  initialGamePlayed: boolean;
};

type LessonEvent = "visit" | "video_completed" | "game_played" | "quiz_submitted";

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          events?: {
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => unknown;
      PlayerState: {
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function isYouTubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function toYouTubeEmbedUrl(url: string) {
  if (!isYouTubeUrl(url)) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    let videoId = "";
    if (host === "youtu.be") {
      videoId = parsed.pathname.replace("/", "");
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v") ?? "";
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.replace("/embed/", "");
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.replace("/shorts/", "");
      }
    }

    if (!videoId) {
      return url;
    }

    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
    const start = parsed.searchParams.get("t") ?? parsed.searchParams.get("start");
    if (start) {
      const seconds = start.replace("s", "");
      if (/^\d+$/.test(seconds)) {
        embedUrl.searchParams.set("start", seconds);
      }
    }

    return embedUrl.toString();
  } catch {
    return url;
  }
}

function withYouTubeApiParams(url: string) {
  const normalized = toYouTubeEmbedUrl(url);
  if (!isYouTubeUrl(normalized)) {
    return normalized;
  }

  const hasQuery = normalized.includes("?");
  const separator = hasQuery ? "&" : "?";
  const withJsApi = normalized.includes("enablejsapi=")
    ? normalized
    : `${normalized}${separator}enablejsapi=1`;
  return withJsApi;
}

async function trackLessonEvent(payload: {
  lessonId: string;
  courseSlug: string;
  lessonSlug: string;
  event: LessonEvent;
  quizScorePercent?: number;
}) {
  await fetch("/api/lesson-activity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function LessonLearningFlow({
  lessonId,
  courseSlug,
  lessonSlug,
  lessonTitle,
  videoUrl,
  gamePath,
  quizId,
  quizTitle,
  quizQuestions,
  isSignedIn,
  isLearner,
  initialVideoCompleted,
  initialGamePlayed,
}: LessonLearningFlowProps) {
  const hasVideo = videoUrl.trim().length > 0;
  const [videoCompleted, setVideoCompleted] = useState(initialVideoCompleted || !hasVideo);
  const [gamePlayed, setGamePlayed] = useState(initialGamePlayed);
  const [isGameFullscreen, setIsGameFullscreen] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const iframeId = useMemo(() => `lesson-video-${lessonId}`, [lessonId]);
  const hasTrackedVisit = useRef(false);
  const gameFrameRef = useRef<HTMLDivElement | null>(null);

  const canTrack = isSignedIn && isLearner;
  const canShowQuiz = hasVideo ? videoCompleted : true;
  const trackedVideoUrl = hasVideo ? withYouTubeApiParams(videoUrl) : "";
  const trackVideoViaYouTubeApi = hasVideo && isYouTubeUrl(trackedVideoUrl);

  const markVideoCompleted = useCallback(async () => {
    if (videoCompleted || !canTrack) {
      return;
    }

    setVideoCompleted(true);
    setIsTracking(true);
    try {
      await trackLessonEvent({
        lessonId,
        courseSlug,
        lessonSlug,
        event: "video_completed",
      });
    } finally {
      setIsTracking(false);
    }
  }, [videoCompleted, canTrack, lessonId, courseSlug, lessonSlug]);

  const markGamePlayed = useCallback(async () => {
    if (gamePlayed || !canTrack) {
      return;
    }

    setGamePlayed(true);
    await trackLessonEvent({
      lessonId,
      courseSlug,
      lessonSlug,
      event: "game_played",
    });
  }, [gamePlayed, canTrack, lessonId, courseSlug, lessonSlug]);

  const markQuizSubmitted = useCallback(
    async (quizScorePercent: number) => {
      if (!canTrack) {
        return;
      }

      await trackLessonEvent({
        lessonId,
        courseSlug,
        lessonSlug,
        event: "quiz_submitted",
        quizScorePercent,
      });
    },
    [canTrack, lessonId, courseSlug, lessonSlug]
  );

  const toggleGameFullscreen = useCallback(async () => {
    const gameFrame = gameFrameRef.current;
    if (!gameFrame) {
      return;
    }

    if (document.fullscreenElement === gameFrame) {
      await document.exitFullscreen();
      return;
    }

    await gameFrame.requestFullscreen();
  }, []);

  useEffect(() => {
    if (!canTrack || hasTrackedVisit.current) {
      return;
    }

    hasTrackedVisit.current = true;
    trackLessonEvent({
      lessonId,
      courseSlug,
      lessonSlug,
      event: "visit",
    }).catch(() => {
      hasTrackedVisit.current = false;
    });
  }, [canTrack, lessonId, courseSlug, lessonSlug]);

  useEffect(() => {
    if (!canTrack || !trackVideoViaYouTubeApi || videoCompleted) {
      return;
    }

    let isActive = true;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player || !isActive) {
        return;
      }

      new window.YT.Player(iframeId, {
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState.ENDED) {
              markVideoCompleted().catch(() => {});
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      setupPlayer();
      return () => {
        isActive = false;
      };
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      setupPlayer();
    };

    return () => {
      isActive = false;
      window.onYouTubeIframeAPIReady = previousReady;
    };
  }, [canTrack, trackVideoViaYouTubeApi, iframeId, videoCompleted, markVideoCompleted]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsGameFullscreen(document.fullscreenElement === gameFrameRef.current);
    };

    // document.addEventListener("fullscreenchange", syncFullscreenState);
    // return () => {
    //   document.removeEventListener("fullscreenchange", syncFullscreenState);
    // };
  }, []);

  return (
    <>
      {hasVideo ? (
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md animate-in fade-in">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
              Lesson Video
            </p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">Watch and learn</h2>
            <p className="mt-1 text-sm text-slate-500">
              Watch the lesson carefully before attempting the quiz.
            </p>
          </div>
          <div className="relative aspect-video w-full bg-slate-950">
            <iframe
              id={iframeId}
              src={trackedVideoUrl}
              title={lessonTitle}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}

      {hasVideo && canTrack && !trackVideoViaYouTubeApi && !videoCompleted ? (
        <div className="mt-4">
          <Button type="button" onClick={() => markVideoCompleted()} disabled={isTracking}>
            {isTracking ? "Saving..." : "Mark Video as Completed"}
          </Button>
        </div>
      ) : null}

      {!isSignedIn ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4">
          <p className="text-sm text-slate-600">
            {hasVideo
              ? "Sign in as a learner to unlock quizzes after completing the lesson video."
              : "Sign in as a learner to track progress and unlock lesson quizzes."}
          </p>
          <div className="mt-3">
            <SignInButton mode="modal">
              <Button
                type="button"
                variant="outline"
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              >
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      ) : null}

      {isSignedIn && !isLearner ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          Admin sessions do not track learner progress and cannot unlock quiz progression.
        </div>
      ) : null}

      {quizTitle && quizQuestions.length > 0 && quizId ? (
        canShowQuiz ? (
          <div className="mt-6">
            <LessonQuiz
              quizId={quizId}
              title={quizTitle}
              questions={quizQuestions}
              onQuizSubmitted={(percent) => {
                markQuizSubmitted(percent).catch(() => {});
              }}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-600">
            {hasVideo ? "Complete the lesson video to unlock the quiz." : "This quiz is not available yet."}
          </div>
        )
      ) : null}

      {gamePath ? (
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
                Practice
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Interactive Game</h2>
              <p className="mt-1 text-sm text-slate-500">
                Play this mini game to practice what you learned in this lesson.
              </p>
            </div>
            <a href={gamePath} target="_blank" rel="noopener noreferrer">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              >
                {isGameFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </Button>
            </a>
          </div>
          <div
            ref={gameFrameRef}
            className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
          >
            <div className="relative h-[520px] w-full bg-white">
              <iframe
                src={gamePath}
                title={`${lessonTitle} interactive game`}
                className="absolute inset-0 h-full w-full"
                allowFullScreen
                onLoad={() => {
                  markGamePlayed().catch(() => {});
                }}
              />
            </div>
          </div>
          {canTrack ? (
            <p className="mt-3 text-xs font-medium text-slate-500">
              {gamePlayed ? "Game activity tracked." : "Game activity will be tracked when loaded."}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
