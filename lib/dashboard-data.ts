import prisma from "@/lib/prisma"
import { getAgeGroupLabel, getDifficultyLabel } from "@/lib/course-data"

export type DashboardMetric = {
  title: string
  value: string
  change: string
  description: string
  footer: string
  trend: "up" | "down" | "neutral"
}

export type DashboardChartPoint = {
  date: string
  courses: number
  lessons: number
}

export type DashboardCourseRow = {
  id: string
  title: string
  slug: string
  status: "Published" | "Draft"
  ageGroup: string
  difficulty: string
  lessonCount: number
  previewCount: number
  quizCount: number
  durationMinutes: number
  updatedAt: string
  description: string
  recentLessons: Array<{
    id: string
    title: string
    durationMinutes: number
    isPreview: boolean
  }>
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatRelativeChange(value: number, singular: string, plural = `${singular}s`) {
  if (value === 0) {
    return `No new ${plural}`
  }

  if (value === 1) {
    return `+1 ${singular}`
  }

  return `+${value} ${plural}`
}

export async function getDashboardData() {
  const now = new Date()
  const lastThirtyDays = new Date(now)
  lastThirtyDays.setDate(lastThirtyDays.getDate() - 30)

  const lastNinetyDays = new Date(now)
  lastNinetyDays.setDate(lastNinetyDays.getDate() - 89)

  const [courses, totalCourses, publishedCourses, totalLessons, totalQuizzes, previewLessons] =
    await prisma.$transaction([
      prisma.course.findMany({
        include: {
          lessons: {
            select: {
              id: true,
              title: true,
              durationMinutes: true,
              isPreview: true,
              createdAt: true,
              quiz: {
                select: {
                  id: true,
                },
              },
            },
            orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
          },
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      }),
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.lesson.count(),
      prisma.quiz.count(),
      prisma.lesson.count({ where: { isPreview: true } }),
    ])

  const courseRows: DashboardCourseRow[] = courses.map((course) => {
    const quizCount = course.lessons.filter((lesson) => lesson.quiz).length

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      status: course.isPublished ? "Published" : "Draft",
      ageGroup: getAgeGroupLabel(course.ageGroup),
      difficulty: getDifficultyLabel(course.difficulty),
      lessonCount: course.lessons.length,
      previewCount: course.lessons.filter((lesson) => lesson.isPreview).length,
      quizCount,
      durationMinutes: course.durationMinutes,
      updatedAt: course.updatedAt.toISOString(),
      description: course.shortDescription,
      recentLessons: course.lessons.slice(0, 3).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        durationMinutes: lesson.durationMinutes,
        isPreview: lesson.isPreview,
      })),
    }
  })

  const chartBuckets = new Map<string, DashboardChartPoint>()
  for (let index = 0; index < 90; index += 1) {
    const date = new Date(lastNinetyDays)
    date.setDate(lastNinetyDays.getDate() + index)
    const key = formatDateKey(date)
    chartBuckets.set(key, {
      date: key,
      courses: 0,
      lessons: 0,
    })
  }

  let newCoursesThisMonth = 0
  let newLessonsThisMonth = 0

  for (const course of courses) {
    if (course.createdAt >= lastThirtyDays) {
      newCoursesThisMonth += 1
    }

    const courseKey = formatDateKey(course.createdAt)
    const courseBucket = chartBuckets.get(courseKey)
    if (courseBucket) {
      courseBucket.courses += 1
    }

    for (const lesson of course.lessons) {
      if (lesson.createdAt >= lastThirtyDays) {
        newLessonsThisMonth += 1
      }

      const lessonKey = formatDateKey(lesson.createdAt)
      const lessonBucket = chartBuckets.get(lessonKey)
      if (lessonBucket) {
        lessonBucket.lessons += 1
      }
    }
  }

  const unpublishedCourses = totalCourses - publishedCourses
  const averageLessonsPerCourse =
    totalCourses > 0 ? (totalLessons / totalCourses).toFixed(1) : "0.0"

  const metrics: DashboardMetric[] = [
    {
      title: "Total Courses",
      value: totalCourses.toString(),
      change: formatRelativeChange(newCoursesThisMonth, "course"),
      footer: "Course catalog size",
      description: `${publishedCourses} published and ${unpublishedCourses} draft`,
      trend: newCoursesThisMonth > 0 ? "up" : "neutral",
    },
    {
      title: "Published Courses",
      value: publishedCourses.toString(),
      change: unpublishedCourses > 0 ? `${unpublishedCourses} drafts` : "All live",
      footer: unpublishedCourses > 0 ? "Drafts still pending" : "Everything is published",
      description: "Live courses visible across the site right now",
      trend: unpublishedCourses > 0 ? "down" : "up",
    },
    {
      title: "Total Lessons",
      value: totalLessons.toString(),
      change: formatRelativeChange(newLessonsThisMonth, "lesson"),
      footer: `${averageLessonsPerCourse} lessons per course`,
      description: `${previewLessons} lessons are available as previews`,
      trend: newLessonsThisMonth > 0 ? "up" : "neutral",
    },
    {
      title: "Quiz Coverage",
      value: totalQuizzes.toString(),
      change:
        totalLessons > 0
          ? `${Math.round((totalQuizzes / totalLessons) * 100)}% of lessons`
          : "No lessons yet",
      footer: "Interactive checks in place",
      description: "Lessons with quizzes update from Prisma on each request",
      trend: totalQuizzes > 0 ? "up" : "neutral",
    },
  ]

  return {
    metrics,
    chartData: Array.from(chartBuckets.values()),
    courseRows,
  }
}
