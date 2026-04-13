import prisma from "@/lib/prisma"
import { getAgeGroupLabel, getDifficultyLabel } from "@/lib/course-data"

export async function getAdminDashboardData() {
  const [users, posts, courses, lessons, quizzes] = await prisma.$transaction([
    prisma.user.findMany({
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            published: true,
          },
          orderBy: {
            id: "desc",
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    }),
    prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    }),
    prisma.course.findMany({
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            slug: true,
            isPreview: true,
            quiz: {
              select: {
                id: true,
              },
            },
          },
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.lesson.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.quiz.findMany({
      include: {
        lesson: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    }),
  ])

  return {
    counts: {
      users: users.length,
      posts: posts.length,
      courses: courses.length,
      lessons: lessons.length,
      quizzes: quizzes.length,
    },
    users: users.map((user) => ({
      ...user,
      postCount: user.posts.length,
      publishedPostCount: user.posts.filter((post) => post.published).length,
    })),
    posts,
    courses: courses.map((course) => ({
      ...course,
      ageGroupLabel: getAgeGroupLabel(course.ageGroup),
      difficultyLabel: getDifficultyLabel(course.difficulty),
      lessonCount: course.lessons.length,
      quizCount: course.lessons.filter((lesson) => lesson.quiz).length,
    })),
    lessons,
    quizzes: quizzes.map((quiz) => ({
      ...quiz,
      questionsText: JSON.stringify(quiz.questions, null, 2),
    })),
    lookups: {
      users: users.map((user) => ({
        id: user.id,
        label: user.name?.trim() || user.email,
        email: user.email,
      })),
      courses: courses.map((course) => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
      })),
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        courseTitle: lesson.course.title,
      })),
    },
  }
}
