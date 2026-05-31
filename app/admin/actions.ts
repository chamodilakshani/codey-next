"use server";

import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getRoleFromSessionClaims, getRoleFromUser } from "@/lib/clerk-role";

import { AgeGroup, Difficulty } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";

async function requireAdminSession() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const claimRole = getRoleFromSessionClaims(sessionClaims);
  if (claimRole === "admin") {
    return;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadataRole = getRoleFromUser(user);
  if (metadataRole !== "admin") {
    throw new Error("Unauthorized");
  }
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getRequiredString(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

function getNumber(formData: FormData, key: string, fallback = 0) {
  const raw = getString(formData, key);
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getRoleFromFormData(formData: FormData) {
  const role = getString(formData, "role");
  if (role === "admin" || role === "learner") {
    return role;
  }
  return "learner";
}

type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

function parseQuizQuestions(raw: string): QuizQuestion[] {
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("quizQuestionsJson must be an array");
  }

  return parsed.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("Each quiz question must be an object");
    }

    const candidate = item as {
      question?: unknown;
      options?: unknown;
      answerIndex?: unknown;
      explanation?: unknown;
    };

    if (typeof candidate.question !== "string" || candidate.question.trim() === "") {
      throw new Error("Each quiz question needs a non-empty question");
    }

    if (!Array.isArray(candidate.options) || candidate.options.length < 2) {
      throw new Error("Each quiz question needs at least two options");
    }

    const options = candidate.options.map((value) => String(value));
    const answerIndex = Number(candidate.answerIndex);
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
      throw new Error("Each quiz question needs a valid answerIndex");
    }

    return {
      question: candidate.question,
      options,
      answerIndex,
      explanation:
        typeof candidate.explanation === "string" && candidate.explanation.trim().length > 0
          ? candidate.explanation
          : undefined,
    } satisfies QuizQuestion;
  });
}

async function saveQuizForLesson(lessonId: string, formData: FormData) {
  const quizTitle = getString(formData, "quizTitle");
  const quizQuestionsJson = getString(formData, "quizQuestionsJson");

  if (!quizTitle && !quizQuestionsJson) {
    await prisma.quiz.deleteMany({ where: { lessonId } });
    return;
  }

  if (!quizTitle || !quizQuestionsJson) {
    throw new Error("Both quizTitle and quizQuestionsJson are required when saving a quiz");
  }

  const questions = parseQuizQuestions(quizQuestionsJson);

  await prisma.quiz.upsert({
    where: { lessonId },
    update: {
      title: quizTitle,
      questions: questions as unknown as object,
    },
    create: {
      lessonId,
      title: quizTitle,
      questions: questions as unknown as object,
    },
  });
}

function getAgeGroup(formData: FormData) {
  const value = getRequiredString(formData, "ageGroup");
  if (value !== AgeGroup.AGE_5_7 && value !== AgeGroup.AGE_8_10 && value !== AgeGroup.AGE_11_13) {
    throw new Error("Invalid ageGroup");
  }
  return value;
}

function getDifficulty(formData: FormData) {
  const value = getRequiredString(formData, "difficulty");
  if (
    value !== Difficulty.BEGINNER &&
    value !== Difficulty.INTERMEDIATE &&
    value !== Difficulty.ADVANCED
  ) {
    throw new Error("Invalid difficulty");
  }
  return value;
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function revalidateAdminAndSite() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/lessons");
  revalidatePath("/dashboard/quizzes");
  revalidatePath("/courses/[courseSlug]", "page");
  revalidatePath("/courses/[courseSlug]/lessons/[lessonSlug]", "page");
}

export async function createUserAction(formData: FormData) {
  await requireAdminSession();
  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");
  const name = getOptionalString(formData, "name");
  const role = getRoleFromFormData(formData);

  const client = await clerkClient();
  await client.users.createUser({
    emailAddress: [email],
    password,
    firstName: name ?? undefined,
    publicMetadata: {
      role,
    },
  });

  revalidateAdminAndSite();
}

export async function updateUserAction(formData: FormData) {
  await requireAdminSession();
  const id = getRequiredString(formData, "id");
  const name = getOptionalString(formData, "name");
  const role = getRoleFromFormData(formData);

  const client = await clerkClient();
  await client.users.updateUser(id, {
    firstName: name ?? undefined,
    publicMetadata: {
      role,
    },
  });

  revalidateAdminAndSite();
}

export async function deleteUserAction(formData: FormData) {
  await requireAdminSession();
  const id = getRequiredString(formData, "id");

  const client = await clerkClient();
  await client.users.deleteUser(id);

  revalidateAdminAndSite();
}

export async function createCourseAction(formData: FormData) {
  await requireAdminSession();
  const slug = normalizeSlug(getRequiredString(formData, "slug"));

  await prisma.course.create({
    data: {
      slug,
      title: getRequiredString(formData, "title"),
      shortDescription: getRequiredString(formData, "shortDescription"),
      description: getRequiredString(formData, "description"),
      thumbnailUrl: getRequiredString(formData, "thumbnailUrl"),
      ageGroup: getAgeGroup(formData),
      difficulty: getDifficulty(formData),
      durationMinutes: Math.max(1, getNumber(formData, "durationMinutes", 1)),
      displayOrder: Math.max(0, getNumber(formData, "displayOrder", 0)),
      isPublished: getBoolean(formData, "isPublished"),
    },
  });

  revalidateAdminAndSite();
}

export async function updateCourseAction(formData: FormData) {
  await requireAdminSession();
  const id = getRequiredString(formData, "id");
  const slug = normalizeSlug(getRequiredString(formData, "slug"));

  await prisma.course.update({
    where: { id },
    data: {
      slug,
      title: getRequiredString(formData, "title"),
      shortDescription: getRequiredString(formData, "shortDescription"),
      description: getRequiredString(formData, "description"),
      thumbnailUrl: getRequiredString(formData, "thumbnailUrl"),
      ageGroup: getAgeGroup(formData),
      difficulty: getDifficulty(formData),
      durationMinutes: Math.max(1, getNumber(formData, "durationMinutes", 1)),
      displayOrder: Math.max(0, getNumber(formData, "displayOrder", 0)),
      isPublished: getBoolean(formData, "isPublished"),
    },
  });

  revalidateAdminAndSite();
}

export async function deleteCourseAction(formData: FormData) {
  await requireAdminSession();
  const id = getRequiredString(formData, "id");

  await prisma.course.delete({ where: { id } });

  revalidateAdminAndSite();
}

export async function createLessonAction(formData: FormData) {
  await requireAdminSession();
  const lesson = await prisma.lesson.create({
    data: {
      levelId: getRequiredString(formData, "levelId"),
      title: getRequiredString(formData, "title"),
      slug: normalizeSlug(getRequiredString(formData, "slug")),
      description: getRequiredString(formData, "description"),
      videoUrl: getRequiredString(formData, "videoUrl"),
      gameHtmlPath: getOptionalString(formData, "gameHtmlPath"),
      durationMinutes: Math.max(1, getNumber(formData, "durationMinutes", 1)),
      displayOrder: Math.max(0, getNumber(formData, "displayOrder", 0)),
      isPreview: getBoolean(formData, "isPreview"),
    },
  });

  const hasQuizFields = formData.has("quizTitle") || formData.has("quizQuestionsJson");
  if (hasQuizFields) {
    await saveQuizForLesson(lesson.id, formData);
  }

  revalidateAdminAndSite();
}

export async function updateLessonAction(formData: FormData) {
  await requireAdminSession();
  const id = getRequiredString(formData, "id");

  await prisma.lesson.update({
    where: { id },
    data: {
      levelId: getRequiredString(formData, "levelId"),
      title: getRequiredString(formData, "title"),
      slug: normalizeSlug(getRequiredString(formData, "slug")),
      description: getRequiredString(formData, "description"),
      videoUrl: getRequiredString(formData, "videoUrl"),
      gameHtmlPath: getOptionalString(formData, "gameHtmlPath"),
      durationMinutes: Math.max(1, getNumber(formData, "durationMinutes", 1)),
      displayOrder: Math.max(0, getNumber(formData, "displayOrder", 0)),
      isPreview: getBoolean(formData, "isPreview"),
    },
  });

  const hasQuizFields = formData.has("quizTitle") || formData.has("quizQuestionsJson");
  if (hasQuizFields) {
    await saveQuizForLesson(id, formData);
  }

  revalidateAdminAndSite();
}

export async function deleteLessonAction(formData: FormData) {
  await requireAdminSession();
  const id = getRequiredString(formData, "id");

  await prisma.lesson.delete({ where: { id } });

  revalidateAdminAndSite();
}

export async function createQuizAction(formData: FormData) {
  await requireAdminSession();
  const lessonId = getRequiredString(formData, "lessonId");
  const title = getRequiredString(formData, "title");
  const quizQuestionsJson = getRequiredString(formData, "quizQuestionsJson");
  const questions = parseQuizQuestions(quizQuestionsJson);

  await prisma.quiz.create({
    data: {
      lessonId,
      title,
      questions: questions as unknown as object,
    },
  });

  revalidateAdminAndSite();
}

export async function updateQuizAction(formData: FormData) {
  await requireAdminSession();
  const id = getRequiredString(formData, "id");
  const lessonId = getRequiredString(formData, "lessonId");
  const title = getRequiredString(formData, "title");
  const quizQuestionsJson = getRequiredString(formData, "quizQuestionsJson");
  const questions = parseQuizQuestions(quizQuestionsJson);

  await prisma.quiz.update({
    where: { id },
    data: {
      lessonId,
      title,
      questions: questions as unknown as object,
    },
  });

  revalidateAdminAndSite();
}

export async function deleteQuizAction(formData: FormData) {
  await requireAdminSession();
  const id = getRequiredString(formData, "id");

  await prisma.quiz.delete({
    where: { id },
  });

  revalidateAdminAndSite();
}
