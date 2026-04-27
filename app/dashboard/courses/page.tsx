import { AppSidebar } from "@/components/app-sidebar";
import { CoursesCrudTable } from "@/components/dashboard/courses-crud-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import prisma from "@/lib/prisma";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      lessons: {
        select: {
          id: true,
        },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  const rows = courses.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    thumbnailUrl: course.thumbnailUrl,
    ageGroup: course.ageGroup,
    difficulty: course.difficulty,
    durationMinutes: course.durationMinutes,
    displayOrder: course.displayOrder,
    isPublished: course.isPublished,
    lessonCount: course.lessons.length,
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
              <CoursesCrudTable courses={rows} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
