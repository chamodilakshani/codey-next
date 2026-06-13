import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getRoleFromSessionClaims } from "@/lib/clerk-role";

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { quizId, answers } = body as { quizId: string; answers: Record<number, number> };

    if (!quizId || !answers) {
      return NextResponse.json({ error: "quizId and answers are required" }, { status: 400 });
    }

    // Fetch the quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { lesson: { include: { level: { include: { course: true } } } } },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    const role = getRoleFromSessionClaims(sessionClaims);
    if (quiz.lesson.level.course.isLocked && role !== "admin") {
      return NextResponse.json({ error: "Course is locked" }, { status: 403 });
    }

    const courseId = quiz.lesson.level.courseId;

    const questions = quiz.questions as unknown as Array<{
      question: string;
      options: string[];
      answerIndex: number;
      explanation?: string;
    }>;

    // Calculate score and save answers
    let correctCount = 0;
    const quizAnswers = Object.entries(answers).map(([questionIndex, selectedOptionIndex]) => {
      const qIndex = parseInt(questionIndex, 10);
      const question = questions[qIndex];
      const isCorrect = selectedOptionIndex === question.answerIndex;
      if (isCorrect) correctCount++;

      return {
        questionIndex: qIndex,
        selectedOptionIndex,
        isCorrect,
        question: question.question,
        options: question.options,
        correctAnswerIndex: question.answerIndex,
        explanation: question.explanation,
      };
    });

    const total = questions.length;
    const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Create quiz attempt with answers
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score: correctCount,
        total,
        percent,
        answers: {
          create: quizAnswers,
        },
      },
      include: {
        answers: true,
      },
    });

    // Check if course is completed (all lessons with quizzes have passing attempts)
    const courseLessonsWithQuizzes = await prisma.lesson.count({
      where: {
        level: { courseId },
        quiz: { isNot: null },
      },
    });

    const passedQuizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        quiz: {
          lesson: { level: { courseId } },
        },
        percent: { gte: 70 }, // Passing score: 70%
      },
      select: {
        quizId: true,
      },
    });
    const passedQuizzes = new Set(passedQuizAttempts.map((attempt) => attempt.quizId)).size;

    // Issue certificate if all quizzes passed
    let certificateIssued = false;
    if (courseLessonsWithQuizzes > 0 && passedQuizzes >= courseLessonsWithQuizzes) {
      const existingCert = await prisma.certificate.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (!existingCert) {
        const certificateCode = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await prisma.certificate.create({
          data: {
            userId,
            courseId,
            certificateCode,
          },
        });
        certificateIssued = true;
      }
    }

    return NextResponse.json({
      attemptId: attempt.id,
      score: correctCount,
      total,
      percent,
      certificateIssued,
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
