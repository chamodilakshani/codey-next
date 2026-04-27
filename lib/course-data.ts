import prisma from "@/lib/prisma";

export async function getPublishedCourses() {
  return prisma.course.findMany({
    where: { isPublished: true },
    include: {
      lessons: {
        select: {
          id: true,
          slug: true,
          title: true,
          durationMinutes: true,
          isPreview: true,
          displayOrder: true,
        },
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getCourseBySlug(courseSlug: string) {
  return prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      lessons: {
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });
}

export async function getLessonBySlugs(courseSlug: string, lessonSlug: string) {
  return prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      course: {
        slug: courseSlug,
      },
    },
    include: {
      quiz: true,
      course: {
        include: {
          lessons: {
            orderBy: {
              displayOrder: "asc",
            },
          },
        },
      },
    },
  });
}

export function getAgeGroupLabel(ageGroup: string) {
  const map: Record<string, string> = {
    AGE_5_7: "Ages 5-7",
    AGE_8_10: "Ages 8-10",
    AGE_11_13: "Ages 11-13",
  };

  return map[ageGroup] ?? ageGroup;
}

export function getDifficultyLabel(difficulty: string) {
  const map: Record<string, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
  };

  return map[difficulty] ?? difficulty;
}

export function getCourseCount() {
  return prisma.course.count({
    where: { isPublished: true },
  });
}

export function getAllcourses() {
  return prisma.course.findMany({
    include: {
      lessons: {
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
}
