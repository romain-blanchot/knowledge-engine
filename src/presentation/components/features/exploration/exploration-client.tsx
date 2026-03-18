"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Briefcase,
  Cog,
  Server,
  Monitor,
  Database,
  Shield,
  TestTube,
  Compass,
  GripVertical,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

type ExplorationCategory =
  | "BUSINESS"
  | "FUNCTIONAL"
  | "BACKEND"
  | "FRONTEND"
  | "DATA"
  | "SECURITY"
  | "TESTING"

type QuestionPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
type QuestionStatus = "OPEN" | "ANSWERED" | "IN_PROGRESS" | "BLOCKED"

interface QuestionData {
  id: string
  question: string
  priority: QuestionPriority
  status: QuestionStatus
  source: string | null
  relatedDocs: string[]
  relatedApis: string[]
}

interface ExplorationPathData {
  id: string
  category: ExplorationCategory
  questions: QuestionData[]
}

const CATEGORY_CONFIG: Record<
  ExplorationCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  BUSINESS: { label: "Questions métier", icon: Briefcase, color: "text-amber-500" },
  FUNCTIONAL: { label: "Questions fonctionnelles", icon: Cog, color: "text-blue-500" },
  BACKEND: { label: "Questions backend", icon: Server, color: "text-emerald-500" },
  FRONTEND: { label: "Questions frontend", icon: Monitor, color: "text-purple-500" },
  DATA: { label: "Questions données", icon: Database, color: "text-cyan-500" },
  SECURITY: { label: "Questions sécurité", icon: Shield, color: "text-red-500" },
  TESTING: { label: "Questions tests", icon: TestTube, color: "text-orange-500" },
}

const PRIORITY_STYLES: Record<QuestionPriority, string> = {
  CRITICAL: "bg-destructive/10 text-destructive",
  HIGH: "bg-amber-500/10 text-amber-500",
  MEDIUM: "bg-blue-500/10 text-blue-500",
  LOW: "bg-muted text-muted-foreground",
}

const PRIORITY_LABELS: Record<QuestionPriority, string> = {
  CRITICAL: "Critique",
  HIGH: "Haute",
  MEDIUM: "Moyenne",
  LOW: "Basse",
}

const PRIORITY_ORDER: Record<QuestionPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

const STATUS_STYLES: Record<QuestionStatus, { className: string; label: string }> = {
  OPEN: { className: "border-border text-foreground", label: "Ouverte" },
  ANSWERED: {
    className: "border-transparent bg-emerald-500/10 text-emerald-500",
    label: "Répondue",
  },
  IN_PROGRESS: {
    className: "border-transparent bg-primary/10 text-primary",
    label: "En cours",
  },
  BLOCKED: {
    className: "border-transparent bg-destructive/10 text-destructive",
    label: "Bloquée",
  },
}

const STATUS_COLUMNS: QuestionStatus[] = ["OPEN", "IN_PROGRESS", "ANSWERED", "BLOCKED"]

function QuestionCard({ q, compact = false }: { q: QuestionData; compact?: boolean }) {
  return (
    <div
      className={cn(
        "border-border bg-card hover:border-primary/20 rounded-xl border transition-all",
        compact ? "p-3" : "p-4",
      )}
    >
      <p className={cn("leading-snug", compact ? "text-sm" : "text-sm font-medium")}>
        {q.question}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge className={cn("text-xs", PRIORITY_STYLES[q.priority])} variant="outline">
          {PRIORITY_LABELS[q.priority]}
        </Badge>
        <Badge className={cn("text-xs", STATUS_STYLES[q.status].className)} variant="outline">
          {STATUS_STYLES[q.status].label}
        </Badge>
        {q.source && <span className="text-muted-foreground text-xs">via {q.source}</span>}
      </div>
      {(q.relatedDocs.length > 0 || q.relatedApis.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {q.relatedDocs.map((doc) => (
            <span
              key={doc}
              className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]"
            >
              {doc}
            </span>
          ))}
          {q.relatedApis.map((api) => (
            <span
              key={api}
              className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]"
            >
              {api}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryView({ paths }: { paths: ExplorationPathData[] }) {
  return (
    <div className="space-y-8">
      {paths.map((path) => {
        const cfg = CATEGORY_CONFIG[path.category]
        const Icon = cfg.icon
        return (
          <motion.div key={path.id} variants={item} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn("bg-muted rounded-lg p-2", cfg.color)}>
                <Icon className="size-5" />
              </div>
              <h3 className="text-lg font-medium">{cfg.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {path.questions.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {path.questions.map((q) => (
                <QuestionCard key={q.id} q={q} />
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function ChecklistView({ paths }: { paths: ExplorationPathData[] }) {
  const allQuestions = useMemo(() => {
    return paths
      .flatMap((p) =>
        p.questions.map((q) => ({
          ...q,
          category: p.category,
        })),
      )
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  }, [paths])

  return (
    <div className="space-y-2">
      {allQuestions.map((q) => {
        const isAnswered = q.status === "ANSWERED"
        return (
          <motion.div
            key={q.id}
            variants={item}
            className={cn(
              "border-border bg-card flex items-start gap-3 rounded-xl border p-4 transition-all",
              isAnswered && "opacity-60",
            )}
          >
            <Checkbox checked={isAnswered} className="mt-0.5" disabled />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm leading-snug",
                  isAnswered && "text-muted-foreground line-through",
                )}
              >
                {q.question}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge className={cn("text-xs", PRIORITY_STYLES[q.priority])} variant="outline">
                  {PRIORITY_LABELS[q.priority]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {CATEGORY_CONFIG[q.category].label}
                </Badge>
                {q.source && <span className="text-muted-foreground text-xs">via {q.source}</span>}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function BoardView({ paths }: { paths: ExplorationPathData[] }) {
  const columns = useMemo(() => {
    const allQuestions = paths.flatMap((p) => p.questions)
    const result: Record<QuestionStatus, QuestionData[]> = {
      OPEN: [],
      IN_PROGRESS: [],
      ANSWERED: [],
      BLOCKED: [],
    }
    for (const q of allQuestions) {
      result[q.status].push(q)
    }
    return result
  }, [paths])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATUS_COLUMNS.map((status) => (
        <div key={status} className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">{STATUS_STYLES[status].label}</h4>
            <Badge variant="secondary" className="text-xs">
              {columns[status].length}
            </Badge>
          </div>
          <div className="border-border bg-muted/30 min-h-[200px] space-y-2 rounded-xl border border-dashed p-3">
            {columns[status].map((q) => (
              <div
                key={q.id}
                className="group border-border bg-card rounded-lg border p-3 shadow-sm transition-all hover:shadow-md"
              >
                <div className="text-muted-foreground mb-2 flex items-center gap-1.5">
                  <GripVertical className="size-3.5" />
                  <Badge
                    className={cn("text-[10px]", PRIORITY_STYLES[q.priority])}
                    variant="outline"
                  >
                    {PRIORITY_LABELS[q.priority]}
                  </Badge>
                </div>
                <p className="text-sm leading-snug">{q.question}</p>
                {q.source && (
                  <p className="text-muted-foreground mt-1.5 text-[10px]">via {q.source}</p>
                )}
              </div>
            ))}
            {columns[status].length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-xs">Aucune question</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ExplorationClient({
  paths,
  projectName,
}: {
  paths: ExplorationPathData[]
  projectName: string
}) {
  const [activeView, setActiveView] = useState("category")

  const totalQuestions = paths.reduce((sum, p) => sum + p.questions.length, 0)

  if (paths.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chemins d&apos;exploration</h1>
          <p className="text-muted-foreground mt-1 text-sm">{projectName}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Compass className="text-muted-foreground size-12" />
          <p className="text-muted-foreground text-lg">Aucun chemin d&apos;exploration</p>
          <p className="text-muted-foreground text-sm">
            Les questions d&apos;exploration apparaîtront ici une fois générées.
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold tracking-tight">Chemins d&apos;exploration</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} dans {paths.length} catégorie
          {paths.length !== 1 ? "s" : ""} — {projectName}
        </p>
      </motion.div>

      {/* View tabs */}
      <motion.div variants={item}>
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList>
            <TabsTrigger value="category">Par catégorie</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="board">Board</TabsTrigger>
          </TabsList>

          <TabsContent value="category" className="mt-6">
            <CategoryView paths={paths} />
          </TabsContent>

          <TabsContent value="checklist" className="mt-6">
            <ChecklistView paths={paths} />
          </TabsContent>

          <TabsContent value="board" className="mt-6">
            <BoardView paths={paths} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
