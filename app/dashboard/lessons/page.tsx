import { AppSidebar } from "@/components/app-sidebar";
import { LessonsCrudTable } from "@/components/dashboard/lessons-crud-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import prisma from "@/lib/prisma";

export default async function LessonsPage() {
  const levelsPromise = prisma.level.findMany({
    select: {
      id: true,
      title: true,
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: [{ courseId: "asc" }, { displayOrder: "asc" }],
  });

  const lessonsPromise = prisma.lesson.findMany({
    include: {
      level: {
        select: {
          title: true,
          course: {
            select: {
              title: true,
            },
          },
        },
      },
      quiz: {
        select: {
          id: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const [levels, lessons] = await Promise.all([
    levelsPromise,
    lessonsPromise,
  ]);

  const lessonRows = lessons.map((lesson) => ({
    id: lesson.id,
    levelId: lesson.levelId,
    levelTitle: lesson.level.title,
    courseTitle: lesson.level.course.title,
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description,
    videoUrl: lesson.videoUrl,
    gameHtmlPath: lesson.gameHtmlPath,
    durationMinutes: lesson.durationMinutes,
    displayOrder: lesson.displayOrder,
    isPreview: lesson.isPreview,
    hasQuiz: Boolean(lesson.quiz),
  }));

  const levelOptions = levels.map((level) => ({
    id: level.id,
    title: `${level.course.title} / ${level.title}`,
  }));

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
              <LessonsCrudTable lessons={lessonRows} levels={levelOptions} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
