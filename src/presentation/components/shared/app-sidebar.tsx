"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  MessageSquare,
  Globe,
  Zap,
  Compass,
  ScrollText,
  Settings,
  Sparkles,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const mainNavItems = [
  { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projets", href: "/projects", icon: FolderKanban },
  { title: "Base documentaire", href: "/knowledge", icon: BookOpen },
  { title: "Assistant Chat", href: "/chat", icon: MessageSquare },
]

const analysisNavItems = [
  { title: "Explorateur API", href: "/api-explorer", icon: Globe },
  { title: "Analyse d'impact", href: "/impact", icon: Zap },
  { title: "Pistes exploratoires", href: "/exploration", icon: Compass },
  { title: "Journal des décisions", href: "/decisions", icon: ScrollText },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">F</span>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">Frogia</span>
            <span className="text-[11px] text-muted-foreground">by FrogWorks</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Analyse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <div className="rounded-lg border border-border/50 bg-accent/30 p-3 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" />
                Ring Context
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Projet actif : Boom Boom Villette
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-muted-foreground">RAG connecté</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings"}
              tooltip="Paramètres"
            >
              <Link href="/settings">
                <Settings />
                <span>Paramètres</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-3 rounded-md p-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <span className="text-xs font-medium text-primary">RL</span>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium">Romain L.</span>
            <span className="text-[11px] text-muted-foreground">Lead Consultant</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
