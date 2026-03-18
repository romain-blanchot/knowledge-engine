"use client"

import { usePathname } from "next/navigation"
import { Search, Bell } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const routeTitles: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/projects": "Projets",
  "/knowledge": "Base documentaire",
  "/chat": "Assistant Chat",
  "/api-explorer": "Explorateur API",
  "/impact": "Analyse d'impact",
  "/exploration": "Pistes exploratoires",
  "/decisions": "Journal des décisions",
  "/settings": "Paramètres",
}

export function AppTopbar() {
  const pathname = usePathname()
  const baseRoute = "/" + pathname.split("/").filter(Boolean)[0]
  const title = routeTitles[baseRoute] || "Frogia"

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-6">
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="mx-2 !h-4" />
      <h1 className="text-sm font-medium">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="h-8 w-64 bg-muted/50 pl-8 text-sm" />
        </div>
        <Button variant="ghost" size="icon" className="relative size-8">
          <Bell className="size-4" />
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            3
          </span>
        </Button>
      </div>
    </header>
  )
}
