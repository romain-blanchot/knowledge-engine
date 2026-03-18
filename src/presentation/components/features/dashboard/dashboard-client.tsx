"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale/fr"
import {
  FileText,
  AlertTriangle,
  Plus,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Compass,
  Landmark,
  BookOpen,
  Building2,
  Target,
  Lightbulb,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ── Animation variants ──────────────────────────────────

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

// ── Types ───────────────────────────────────────────────

interface DashboardData {
  id: string
  name: string
  client: string
  industry: string
  phase: string
  summary: string
  description: string
  lastActivity: string
  issues: {
    id: string
    title: string
    description: string | null
    severity: string
    resolved: boolean
  }[]
  documents: { id: string; title: string; category: string }[]
  decisions: { id: string; title: string; status: string }[]
  explorations: {
    id: string
    category: string
    questions: { id: string; status: string; question: string }[]
  }[]
  activities: { id: string; type: string; description: string; createdAt: string }[]
}

// ── Phase indicator ─────────────────────────────────────

const PHASES = [
  { key: "PREPARATION", label: "Préparation" },
  { key: "CADRAGE", label: "Cadrage" },
  { key: "PROPOSITION", label: "Proposition" },
  { key: "MISSION", label: "Mission" },
]

function PhaseIndicator({ currentPhase }: { currentPhase: string }) {
  const currentIndex = PHASES.findIndex((p) => p.key === currentPhase)
  return (
    <div className="flex items-center gap-2">
      {PHASES.map((phase, index) => {
        const isCurrent = index === currentIndex
        const isCompleted = index < currentIndex
        return (
          <div key={phase.key} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "size-2.5 rounded-full transition-all",
                  isCurrent && "bg-primary ring-primary/20 ring-4",
                  isCompleted && "bg-primary",
                  !isCurrent && !isCompleted && "bg-border",
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  isCurrent && "text-foreground font-medium",
                  isCompleted && "text-primary font-medium",
                  !isCurrent && !isCompleted && "text-muted-foreground",
                )}
              >
                {phase.label}
              </span>
            </div>
            {index < PHASES.length - 1 && (
              <div
                className={cn("h-px w-6", isCompleted ? "bg-primary" : "bg-border")}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Mind Map ────────────────────────────────────────────

interface MindMapBranch {
  label: string
  count: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  items: string[]
}

function MindMap({ data }: { data: DashboardData }) {
  const [hoveredBranch, setHoveredBranch] = useState<number | null>(null)

  const contextDocs = data.documents.filter(
    (d) => d.category === "BUSINESS_CONTEXT" || d.category === "COMPANY_KNOWLEDGE",
  )
  const enjeuxQuestions = data.explorations
    .filter((e) => e.category === "ENJEUX_SECTORIELS" || e.category === "CONTEXTE_ENTREPRISE")
    .flatMap((e) => e.questions)
  const cadrageQuestions = data.explorations
    .filter((e) => e.category === "PISTES_CADRAGE" || e.category === "HYPOTHESES")
    .flatMap((e) => e.questions)

  const branches: MindMapBranch[] = [
    {
      label: "Contexte",
      count: contextDocs.length,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
      items: contextDocs.map((d) => d.title),
    },
    {
      label: "Enjeux",
      count: enjeuxQuestions.length,
      icon: Target,
      color: "text-amber-600",
      bgColor: "bg-amber-50 border-amber-200",
      items: enjeuxQuestions.slice(0, 4).map((q) => q.question),
    },
    {
      label: "Cadrage",
      count: cadrageQuestions.length,
      icon: Compass,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-200",
      items: cadrageQuestions.slice(0, 4).map((q) => q.question),
    },
    {
      label: "Décisions",
      count: data.decisions.length,
      icon: Landmark,
      color: "text-purple-600",
      bgColor: "bg-purple-50 border-purple-200",
      items: data.decisions.map((d) => d.title),
    },
  ]

  // SVG line positions (center node connects to each branch)
  const branchPositions = [
    { x: 130, y: 60 }, // top-left
    { x: 420, y: 60 }, // top-right
    { x: 130, y: 230 }, // bottom-left
    { x: 420, y: 230 }, // bottom-right
  ]
  const centerX = 275
  const centerY = 145

  return (
    <div className="relative min-h-[320px] w-full">
      {/* SVG lines connecting center to branches */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 550 290"
        preserveAspectRatio="xMidYMid meet"
      >
        {branchPositions.map((pos, i) => (
          <motion.line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={pos.x}
            y2={pos.y}
            stroke={hoveredBranch === i ? "var(--color-primary)" : "var(--color-border)"}
            strokeWidth={hoveredBranch === i ? 2.5 : 1.5}
            strokeDasharray={hoveredBranch === i ? "0" : "6 4"}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
          />
        ))}
      </svg>

      {/* Center node */}
      <motion.div
        className="bg-primary text-primary-foreground absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl px-5 py-3 shadow-lg"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        <p className="text-center text-sm font-semibold">{data.name}</p>
      </motion.div>

      {/* Branch nodes */}
      {branches.map((branch, i) => {
        const Icon = branch.icon
        const positions = [
          "left-0 top-0", // top-left
          "right-0 top-0", // top-right
          "left-0 bottom-0", // bottom-left
          "right-0 bottom-0", // bottom-right
        ]
        return (
          <motion.div
            key={branch.label}
            className={cn("absolute z-10 w-[200px]", positions[i])}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
            onMouseEnter={() => setHoveredBranch(i)}
            onMouseLeave={() => setHoveredBranch(null)}
          >
            <div
              className={cn(
                "cursor-default rounded-xl border p-3.5 transition-all",
                branch.bgColor,
                hoveredBranch === i && "shadow-md",
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("size-4", branch.color)} />
                <span className={cn("text-sm font-semibold", branch.color)}>
                  {branch.label}
                </span>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  {branch.count}
                </Badge>
              </div>

              {/* Sub-items shown on hover */}
              <motion.div
                initial={false}
                animate={{
                  height: hoveredBranch === i ? "auto" : 0,
                  opacity: hoveredBranch === i ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1 border-t border-current/10 pt-2">
                  {branch.items.slice(0, 3).map((label, j) => (
                    <p key={j} className="truncate text-[11px] text-foreground/70">
                      {label}
                    </p>
                  ))}
                  {branch.items.length > 3 && (
                    <p className="text-[10px] text-muted-foreground">
                      +{branch.items.length - 3} autres
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Activity timeline ───────────────────────────────────

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  document_added: FileText,
  document_indexed: CheckCircle2,
  question_asked: HelpCircle,
  decision_made: Landmark,
  exploration_update: Compass,
  conversation_created: BookOpen,
}

const ACTIVITY_COLORS: Record<string, string> = {
  document_added: "bg-info text-info-foreground",
  document_indexed: "bg-success text-success-foreground",
  question_asked: "bg-warning text-warning-foreground",
  decision_made: "bg-primary text-primary-foreground",
  exploration_update: "bg-chart-5 text-white",
  conversation_created: "bg-chart-2 text-white",
}

// ── Severity helpers ────────────────────────────────────

const SEVERITY_DOT: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-muted-foreground",
}

// ── Main component ──────────────────────────────────────

export function DashboardClient({ data }: { data: DashboardData | null }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <FileText className="text-muted-foreground size-12" />
        <p className="text-muted-foreground text-lg">Aucun projet actif</p>
        <p className="text-muted-foreground text-sm">Créez un projet pour commencer.</p>
      </div>
    )
  }

  const totalQuestions = data.explorations.reduce((s, e) => s + e.questions.length, 0)
  const acceptedQuestions = data.explorations
    .flatMap((e) => e.questions)
    .filter((q) => q.status === "ACCEPTED").length
  const openQuestions = data.explorations
    .flatMap((e) => e.questions)
    .filter((q) => q.status === "OPEN").length
  const pisteCount = data.explorations
    .filter((e) => e.category === "PISTES_CADRAGE")
    .reduce((s, e) => s + e.questions.length, 0)
  const hypotheseCount = data.explorations
    .filter((e) => e.category === "HYPOTHESES")
    .reduce((s, e) => s + e.questions.length, 0)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* ── Project header ─────────────────────── */}
      <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
              <p className="text-muted-foreground text-sm">{data.industry}</p>
            </div>
            <span className="text-muted-foreground text-xs">
              Dernière activité{" "}
              {formatDistanceToNow(new Date(data.lastActivity), {
                locale: fr,
                addSuffix: true,
              })}
            </span>
          </div>
          <PhaseIndicator currentPhase={data.phase} />
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">{data.summary}</p>
        </div>
      </motion.div>

      {/* ── Two-column layout ──────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left: Mind Map (60%) */}
        <motion.div
          variants={item}
          className="rounded-xl border border-border bg-card p-6 lg:col-span-3"
        >
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="text-primary size-5" />
            <h2 className="text-lg font-medium">Cartographie projet</h2>
          </div>
          <MindMap data={data} />
        </motion.div>

        {/* Right column (40%) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Issues */}
          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Problématiques</h2>
              <Button variant="ghost" size="sm" className="text-xs">
                <Plus className="mr-1 size-3.5" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-3">
              {data.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <div
                    className={cn(
                      "mt-1.5 size-2 flex-shrink-0 rounded-full",
                      SEVERITY_DOT[issue.severity] ?? "bg-muted-foreground",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{issue.title}</p>
                    {issue.description && (
                      <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                        {issue.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {data.issues.length === 0 && (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  Aucune problématique
                </p>
              )}
            </div>
          </motion.div>

          {/* Preparation card */}
          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-lg font-medium">Préparation RDV</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{totalQuestions} questions</span>
                <Badge variant="secondary" className="text-xs">
                  {acceptedQuestions} retenues
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{pisteCount} pistes de cadrage</span>
                <Badge variant="outline" className="text-xs">
                  {openQuestions} à explorer
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {hypotheseCount} hypothèses à valider
                </span>
              </div>
            </div>
            <a
              href="/exploration"
              className="text-primary mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Voir les pistes
              <ArrowRight className="size-3.5" />
            </a>
          </motion.div>

          {/* Activity timeline */}
          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-medium">Activité récente</h2>
            {data.activities.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune activité.</p>
            ) : (
              <div className="relative space-y-4">
                {/* Timeline line */}
                <div className="absolute bottom-0 left-[13px] top-2 w-px bg-border" />

                {data.activities.slice(0, 6).map((activity) => {
                  const Icon = ACTIVITY_ICONS[activity.type] ?? FileText
                  const colorClass =
                    ACTIVITY_COLORS[activity.type] ?? "bg-muted text-muted-foreground"
                  return (
                    <div key={activity.id} className="relative flex items-start gap-3 pl-0">
                      <div
                        className={cn(
                          "z-10 flex size-[26px] flex-shrink-0 items-center justify-center rounded-full",
                          colorClass,
                        )}
                      >
                        <Icon className="size-3" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm leading-snug">{activity.description}</p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            locale: fr,
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
