import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UsersCrudTable } from "@/components/dashboard/users-crud-table";
import { clerkClient } from "@clerk/nextjs/server";
import { getRoleFromUser } from "@/lib/clerk-role";

export default async function UsersPage() {
  const client = await clerkClient();
  const userList = await client.users.getUserList({
    limit: 100,
  });

  const rows = userList.data.map((user) => ({
    id: user.id,
    name: user.firstName ?? user.fullName ?? null,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    role: getRoleFromUser(user),
    createdAtLabel: new Date(user.createdAt).toLocaleDateString(),
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
              <UsersCrudTable users={rows} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
