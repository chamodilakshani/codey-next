"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LessonQuiz } from "@/components/lesson/lesson-quiz";

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

function withYouTubeApiParams(url: string) {
  if (!isYouTubeUrl(url)) {
    return url;
  }

  const hasQuery = url.includes("?");
  const separator = hasQuery ? "&" : "?";
  const withJsApi = url.includes("enablejsapi=") ? url : `${url}${separator}enablejsapi=1`;
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
  quizTitle,
  quizQuestions,
  isSignedIn,
  isLearner,
  initialVideoCompleted,
  initialGamePlayed,
}: LessonLearningFlowProps) {
  const [videoCompleted, setVideoCompleted] = useState(initialVideoCompleted);
  const [gamePlayed, setGamePlayed] = useState(initialGamePlayed);
  const [isTracking, setIsTracking] = useState(false);
  const iframeId = useMemo(() => `lesson-video-${lessonId}`, [lessonId]);
  const hasTrackedVisit = useRef(false);

  const canTrack = isSignedIn && isLearner;
  const canShowQuiz = videoCompleted;
  const trackedVideoUrl = withYouTubeApiParams(videoUrl);
  const trackVideoViaYouTubeApi = isYouTubeUrl(trackedVideoUrl);

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

  const markQuizSubmitted = useCallback(async (quizScorePercent: number) => {
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
  }, [canTrack, lessonId, courseSlug, lessonSlug]);

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

  return (
    <>
      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-muted/30">
        <div className="relative aspect-video w-full">
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

      {canTrack && !trackVideoViaYouTubeApi && !videoCompleted ? (
        <div className="mt-4">
          <Button type="button" onClick={() => markVideoCompleted()} disabled={isTracking}>
            {isTracking ? "Saving..." : "Mark Video as Completed"}
          </Button>
        </div>
      ) : null}

      {!isSignedIn ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-4">
          <p className="text-sm text-muted-foreground">
            Sign in as a learner to unlock quizzes after completing the lesson video.
          </p>
          <div className="mt-3">
            <SignInButton mode="modal">
              <Button type="button" variant="outline">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      ) : null}

      {isSignedIn && !isLearner ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          Admin sessions do not track learner progress and cannot unlock quiz progression.
        </div>
      ) : null}

      {quizTitle && quizQuestions.length > 0 ? (
        canShowQuiz ? (
          <div className="mt-6">
            <LessonQuiz
              title={quizTitle}
              questions={quizQuestions}
              onSubmitted={({ percent }) => markQuizSubmitted(percent)}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Complete the lesson video to unlock the quiz.
          </div>
        )
      ) : null}

      {gamePath ? (
        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card p-4 sm:p-5">
          <h2 className="text-xl font-semibold">Interactive Game</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Play this mini game to practice what you learned in this lesson.
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-muted/20">
            <div className="relative h-[520px] w-full">
              <iframe
                src={gamePath}
                title={`${lessonTitle} interactive game`}
                className="absolute inset-0 h-full w-full"
                onLoad={() => {
                  markGamePlayed().catch(() => {});
                }}
              />
            </div>
          </div>
          {canTrack ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {gamePlayed ? "Game activity tracked." : "Game activity will be tracked when loaded."}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
