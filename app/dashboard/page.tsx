import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getDashboardData } from "@/lib/dashboard-data"

export default async function Page() {
  const { metrics, chartData, courseRows } = await getDashboardData()
  const tableData = courseRows.map((course, index) => ({
    id: index + 1,
    header: course.title,
    type: `${course.ageGroup} ${course.difficulty}`,
    status: course.status === "Published" ? "Done" : "In Progress",
    target: course.lessonCount.toString(),
    limit: course.quizCount.toString(),
    reviewer: course.recentLessons[0]?.title ?? "Assign reviewer",
  }))

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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards metrics={metrics} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive data={chartData} />
              </div>
              {/* < data={tableData} /> */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
