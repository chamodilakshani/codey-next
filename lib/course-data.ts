import prisma from "@/lib/prisma";

function flattenCourseLessons(course: {
  levels: Array<{
    lessons: Array<{
      id: string;
      slug: string;
      title: string;
      durationMinutes: number;
      isPreview: boolean;
      displayOrder: number;
      description?: string;
    }>;
  }>;
}) {
  return course.levels.flatMap((level) => level.lessons);
}

export async function getPublishedCourses() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      levels: {
        orderBy: { displayOrder: "asc" },
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
      },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return courses.map((course) => ({ ...course, lessons: flattenCourseLessons(course) }));
}

export async function getCourseBySlug(courseSlug: string) {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      levels: {
        orderBy: { displayOrder: "asc" },
        include: { lessons: { orderBy: { displayOrder: "asc" } } },
      },
    },
  });

  return course ? { ...course, lessons: flattenCourseLessons(course) } : null;
}

export async function getLevelsByCourseSlug(courseSlug: string) {
  return prisma.level.findMany({
    where: {
      course: {
        slug: courseSlug,
      },
    },
    include: {
      levels: {
        orderBy: { displayOrder: "asc" },
        include: { lessons: { orderBy: { displayOrder: "asc" } } },
      },
    },
    orderBy: {
      displayOrder: "asc",
    },
  });

  return course ? { ...course, lessons: flattenCourseLessons(course) } : null;
}

export async function getLessonBySlugs(courseSlug: string, lessonSlug: string) {
  return prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      level: {
        course: {
          slug: courseSlug,
        },
      },
    },
    include: {
      quiz: true,
      level: {
        include: {
          course: {
            include: {
              levels: {
                orderBy: { displayOrder: "asc" },
                include: {
                  lessons: {
                    orderBy: {
                      displayOrder: "asc",
                    },
                  },
                },
              },
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
      levels: {
        orderBy: { displayOrder: "asc" },
        include: { lessons: { orderBy: { displayOrder: "asc" } } },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  }).then((courses) => courses.map((course) => ({ ...course, lessons: flattenCourseLessons(course) })));
}
