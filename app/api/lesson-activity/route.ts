import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  getRoleFromSessionClaims,
  getRoleFromUser,
  parseLessonActivityMap,
  type LessonActivityEntry,
} from "@/lib/clerk-role";
import prisma from "@/lib/prisma";

type LessonEvent = "visit" | "video_completed" | "game_played" | "quiz_submitted";

type ActivityRequest = {
  lessonId: string;
  courseSlug: string;
  lessonSlug: string;
  event: LessonEvent;
  quizScorePercent?: number;
};

function isValidEvent(value: unknown): value is LessonEvent {
  return (
    value === "visit" ||
    value === "video_completed" ||
    value === "game_played" ||
    value === "quiz_submitted"
  );
}

function getTimestamp() {
  return new Date().toISOString();
}

function applyEvent(
  existing: LessonActivityEntry | undefined,
  payload: ActivityRequest
): LessonActivityEntry {
  const base: LessonActivityEntry = {
    lessonId: payload.lessonId,
    courseSlug: payload.courseSlug,
    lessonSlug: payload.lessonSlug,
    ...existing,
    lastVisitedAt: getTimestamp(),
  };

  if (payload.event === "video_completed") {
    base.videoCompletedAt = getTimestamp();
  }

  if (payload.event === "game_played") {
    base.gamePlayedAt = getTimestamp();
  }

  if (payload.event === "quiz_submitted") {
    base.quizSubmittedAt = getTimestamp();
    if (typeof payload.quizScorePercent === "number") {
      base.quizScorePercent = payload.quizScorePercent;
    }
  }

  return base;
}

export async function GET(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role =
    getRoleFromSessionClaims(sessionClaims) === "admin"
      ? "admin"
      : getRoleFromUser(user);
  if (role === "admin") {
    return NextResponse.json({ activity: null });
  }

  const lessonId = request.nextUrl.searchParams.get("lessonId");
  if (!lessonId) {
    return NextResponse.json({ message: "lessonId is required" }, { status: 400 });
  }

  const activityMap = parseLessonActivityMap(user.privateMetadata?.lessonActivity);
  const activity = activityMap[lessonId] ?? null;

  return NextResponse.json({ activity });
}

export async function POST(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role =
    getRoleFromSessionClaims(sessionClaims) === "admin"
      ? "admin"
      : getRoleFromUser(user);
  if (role === "admin") {
    return NextResponse.json({ message: "Admin users are excluded from learner tracking" }, { status: 403 });
  }

  const payload = (await request.json()) as Partial<ActivityRequest>;
  if (
    typeof payload.lessonId !== "string" ||
    typeof payload.courseSlug !== "string" ||
    typeof payload.lessonSlug !== "string" ||
    !isValidEvent(payload.event)
  ) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: payload.lessonId },
    select: {
      level: {
        select: {
          course: {
            select: {
              isLocked: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!lesson || lesson.level.course.slug !== payload.courseSlug) {
    return NextResponse.json({ message: "Lesson not found" }, { status: 404 });
  }

  if (lesson.level.course.isLocked) {
    return NextResponse.json({ message: "Course is locked" }, { status: 403 });
  }

  const activityMap = parseLessonActivityMap(user.privateMetadata?.lessonActivity);
  const currentEntry = activityMap[payload.lessonId];
  const nextEntry = applyEvent(currentEntry, payload as ActivityRequest);

  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...user.privateMetadata,
      lessonActivity: {
        ...activityMap,
        [payload.lessonId]: nextEntry,
      },
    },
  });

  return NextResponse.json({ activity: nextEntry });
}
