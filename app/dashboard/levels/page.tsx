import { AppSidebar } from "@/components/app-sidebar";
import { LevelsCrudTable } from "@/components/dashboard/levels-crud-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import prisma from "@/lib/prisma";

export default async function LevelsPage() {
  const [courses, levels] = await prisma.$transaction([
    prisma.course.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.level.findMany({
      include: {
        course: {
          select: {
            title: true,
          },
        },
        lessons: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [{ displayOrder: "asc" }],
    }),
  ]);

  const courseOptions = courses.map((course) => ({
    id: course.id,
    title: course.title,
  }));

  const levelRows = levels.map((level) => ({
    id: level.id,
    courseId: level.courseId,
    courseTitle: level.course.title,
    title: level.title,
    slug: level.slug,
    displayOrder: level.displayOrder,
    lessonCount: level.lessons.length,
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
              <LevelsCrudTable levels={levelRows} courses={courseOptions} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
