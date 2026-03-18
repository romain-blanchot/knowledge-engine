"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale/fr"
import { Search, FileText, Globe, Landmark, FolderOpen } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

interface ProjectItem {
  id: string
  name: string
  client: string
  description: string
  status: string
  industry: string
  completionScore: number
  lastActivity: string
  documentsCount: number
  apiEndpointsCount: number
  decisionsCount: number
}

interface ProjectsClientProps {
  projects: ProjectItem[]
  industries: string[]
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  DRAFT: "Brouillon",
  COMPLETED: "Terminé",
  ARCHIVED: "Archivé",
}

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success border-success/30",
  DRAFT: "bg-warning/15 text-warning border-warning/30",
  COMPLETED: "bg-info/15 text-info border-info/30",
  ARCHIVED: "bg-muted text-muted-foreground border-border",
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "ACTIVE", label: "Actif" },
  { value: "DRAFT", label: "Brouillon" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "ARCHIVED", label: "Archivé" },
]

export function ProjectsClient({ projects, industries }: ProjectsClientProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [industryFilter, setIndustryFilter] = useState("ALL")

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.client.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter
      const matchesIndustry = industryFilter === "ALL" || p.industry === industryFilter
      return matchesSearch && matchesStatus && matchesIndustry
    })
  }, [projects, search, statusFilter, industryFilter])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Page header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
        <p className="text-muted-foreground mt-1">Espaces de travail et projets clients</p>
      </motion.div>

      {/* Filters bar */}
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Rechercher un projet ou un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toutes les industries</SelectItem>
            {industries.map((ind) => (
              <SelectItem key={ind} value={ind}>
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <motion.div
          variants={item}
          className="flex flex-col items-center justify-center gap-4 py-20"
        >
          <FolderOpen className="text-muted-foreground size-12" />
          <p className="text-muted-foreground text-lg">Aucun projet trouvé</p>
          <p className="text-muted-foreground text-sm">
            Modifiez vos filtres ou créez un nouveau projet.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filtered.map((project, index) => (
            <motion.div
              key={project.id}
              variants={item}
              custom={index}
              className="group border-border bg-card hover:border-primary/50 rounded-xl border p-6 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-semibold">{project.name}</h3>
                  <p className="text-muted-foreground text-sm">{project.client}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {project.industry}
                  </Badge>
                  <Badge
                    className={cn(
                      "border text-xs",
                      STATUS_CLASSES[project.status] ?? "bg-muted text-muted-foreground",
                    )}
                  >
                    {STATUS_LABELS[project.status] ?? project.status}
                  </Badge>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 flex items-center gap-3">
                <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${project.completionScore}%` }}
                  />
                </div>
                <span className="text-muted-foreground font-mono text-xs font-semibold">
                  {project.completionScore}%
                </span>
              </div>

              {/* Stats row */}
              <div className="text-muted-foreground mt-4 flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3.5" />
                  <span className="font-mono">{project.documentsCount}</span> documents
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="size-3.5" />
                  <span className="font-mono">{project.apiEndpointsCount}</span> APIs
                </span>
                <span className="flex items-center gap-1.5">
                  <Landmark className="size-3.5" />
                  <span className="font-mono">{project.decisionsCount}</span> décisions
                </span>
              </div>

              {/* Footer */}
              <div className="mt-5 flex items-center justify-between">
                <p className="text-muted-foreground text-xs">
                  Dernière activité{" "}
                  <span className="font-mono">
                    {formatDistanceToNow(new Date(project.lastActivity), {
                      locale: fr,
                      addSuffix: true,
                    })}
                  </span>
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/projects/${project.id}`}>Ouvrir l&apos;espace</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
