import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { AppTopbar } from "@/components/shared/app-topbar"
import QueryProvider from "@/presentation/providers/QueryProvider"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppTopbar />
          <div className="flex-1 overflow-auto p-6 lg:p-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </QueryProvider>
  )
}
