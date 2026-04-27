import { AppSidebar } from "@/components/app-sidebar";
import { QuizzesCrudTable } from "@/components/dashboard/quizzes-crud-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import prisma from "@/lib/prisma";

export default async function QuizzesPage() {
  const [lessons, quizzes] = await prisma.$transaction([
    prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        course: {
          select: {
            title: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.quiz.findMany({
      include: {
        lesson: {
          select: {
            title: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
  ]);

  const lessonOptions = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    courseTitle: lesson.course.title,
  }));

  const quizRows = quizzes.map((quiz) => ({
    id: quiz.id,
    lessonId: quiz.lessonId,
    lessonTitle: quiz.lesson.title,
    courseTitle: quiz.lesson.course.title,
    title: quiz.title,
    questionsJson: JSON.stringify(quiz.questions, null, 2),
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
              <QuizzesCrudTable quizzes={quizRows} lessons={lessonOptions} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
