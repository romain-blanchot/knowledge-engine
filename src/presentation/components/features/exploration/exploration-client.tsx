"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  Target,
  MessageCircleQuestion,
  Lightbulb,
  Compass,
  GripVertical,
  Check,
  X,
  Plus,
  Sparkles,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

// ── Animation variants ──────────────────────────────────

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

// ── Types ───────────────────────────────────────────────

type ExplorationCategory =
  | "CONTEXTE_ENTREPRISE"
  | "ENJEUX_SECTORIELS"
  | "QUESTIONS_RDV"
  | "HYPOTHESES"
  | "PISTES_CADRAGE"

type QuestionPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
type QuestionStatus = "OPEN" | "ACCEPTED" | "REJECTED" | "IN_PROGRESS"

interface QuestionData {
  id: string
  question: string
  priority: QuestionPriority
  status: QuestionStatus
  source: string | null
  relatedDocs: string[]
}

interface ExplorationPathData {
  id: string
  category: ExplorationCategory
  questions: QuestionData[]
}

// ── Config ──────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  ExplorationCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  CONTEXTE_ENTREPRISE: { label: "Contexte entreprise", icon: Building2, color: "text-blue-500" },
  ENJEUX_SECTORIELS: { label: "Enjeux sectoriels", icon: Target, color: "text-amber-500" },
  QUESTIONS_RDV: {
    label: "Questions pour le RDV",
    icon: MessageCircleQuestion,
    color: "text-emerald-500",
  },
  HYPOTHESES: { label: "Hypothèses à valider", icon: Lightbulb, color: "text-purple-500" },
  PISTES_CADRAGE: { label: "Pistes de cadrage", icon: Compass, color: "text-cyan-500" },
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

const STATUS_CONFIG: Record<QuestionStatus, { className: string; label: string }> = {
  OPEN: { className: "border-border text-foreground", label: "À explorer" },
  ACCEPTED: {
    className: "border-transparent bg-emerald-500/10 text-emerald-500",
    label: "Retenue",
  },
  REJECTED: {
    className: "border-transparent bg-muted text-muted-foreground line-through",
    label: "Écartée",
  },
  IN_PROGRESS: {
    className: "border-transparent bg-primary/10 text-primary",
    label: "En cours",
  },
}

const STATUS_COLUMNS: QuestionStatus[] = ["OPEN", "IN_PROGRESS", "ACCEPTED", "REJECTED"]

// ── Generated questions for "Générer" feature ───────────

const GENERATED_QUESTIONS: QuestionData[] = [
  {
    id: "gen-1",
    question: "Quel est le taux de remplissage moyen par créneau le week-end ?",
    priority: "HIGH",
    status: "OPEN",
    source: "IA",
    relatedDocs: [],
  },
  {
    id: "gen-2",
    question: "Comment gérer les réservations de groupe (> 10 personnes) ?",
    priority: "MEDIUM",
    status: "OPEN",
    source: "IA",
    relatedDocs: [],
  },
  {
    id: "gen-3",
    question: "Faut-il prévoir une file d'attente digitale pour les sans-réservation ?",
    priority: "MEDIUM",
    status: "OPEN",
    source: "IA",
    relatedDocs: [],
  },
]

// ── Question card with actions ──────────────────────────

function QuestionCard({
  q,
  compact = false,
  onAccept,
  onReject,
}: {
  q: QuestionData
  compact?: boolean
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
}) {
  const isRejected = q.status === "REJECTED"
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card transition-all hover:border-primary/20",
        compact ? "p-3" : "p-4",
        isRejected && "opacity-50",
      )}
    >
      <p
        className={cn(
          "text-sm leading-snug",
          !compact && "font-medium",
          isRejected && "line-through",
        )}
      >
        {q.question}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge className={cn("text-xs", PRIORITY_STYLES[q.priority])} variant="outline">
          {PRIORITY_LABELS[q.priority]}
        </Badge>
        <Badge className={cn("text-xs", STATUS_CONFIG[q.status].className)} variant="outline">
          {STATUS_CONFIG[q.status].label}
        </Badge>
        {q.source && <span className="text-muted-foreground text-xs">via {q.source}</span>}
      </div>
      {onAccept && onReject && q.status !== "ACCEPTED" && q.status !== "REJECTED" && (
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            onClick={() => onAccept(q.id)}
          >
            <Check className="size-3" />
            Retenir
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
            onClick={() => onReject(q.id)}
          >
            <X className="size-3" />
            Écarter
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Add question input ──────────────────────────────────

function AddQuestionInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value.trim())
      setValue("")
      setOpen(false)
    }
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => setOpen(true)}>
        <Plus className="mr-1 size-3.5" />
        Ajouter une question
      </Button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-2 flex gap-2"
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Votre question..."
        className="h-8 text-sm"
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        autoFocus
      />
      <Button size="sm" className="h-8 text-xs" onClick={handleSubmit}>
        Ajouter
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 text-xs"
        onClick={() => {
          setOpen(false)
          setValue("")
        }}
      >
        Annuler
      </Button>
    </motion.div>
  )
}

// ── Category View ───────────────────────────────────────

function CategoryView({
  paths,
  onAccept,
  onReject,
  onAdd,
}: {
  paths: ExplorationPathData[]
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onAdd: (categoryId: string, text: string) => void
}) {
  return (
    <div className="space-y-8">
      {paths.map((path) => {
        const cfg = CATEGORY_CONFIG[path.category]
        const Icon = cfg.icon
        return (
          <motion.div key={path.id} variants={item} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg bg-muted p-2", cfg.color)}>
                <Icon className="size-5" />
              </div>
              <h3 className="text-lg font-medium">{cfg.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {path.questions.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {path.questions.map((q) => (
                <QuestionCard key={q.id} q={q} onAccept={onAccept} onReject={onReject} />
              ))}
            </div>
            <AddQuestionInput onAdd={(text) => onAdd(path.id, text)} />
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Checklist View ──────────────────────────────────────

function ChecklistView({
  paths,
  onAccept,
  onReject,
}: {
  paths: ExplorationPathData[]
  onAccept: (id: string) => void
  onReject: (id: string) => void
}) {
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
        const isAccepted = q.status === "ACCEPTED"
        const isRejected = q.status === "REJECTED"
        return (
          <motion.div
            key={q.id}
            variants={item}
            className={cn(
              "flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all",
              isRejected && "opacity-50",
            )}
          >
            <Checkbox
              checked={isAccepted}
              className="mt-0.5"
              onCheckedChange={(checked) => {
                if (checked) onAccept(q.id)
                else onReject(q.id)
              }}
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm leading-snug",
                  isAccepted && "text-muted-foreground line-through",
                  isRejected && "text-muted-foreground line-through",
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

// ── Board View ──────────────────────────────────────────

function BoardView({ paths }: { paths: ExplorationPathData[] }) {
  const columns = useMemo(() => {
    const allQuestions = paths.flatMap((p) => p.questions)
    const result: Record<QuestionStatus, QuestionData[]> = {
      OPEN: [],
      IN_PROGRESS: [],
      ACCEPTED: [],
      REJECTED: [],
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
            <h4 className="text-sm font-semibold">{STATUS_CONFIG[status].label}</h4>
            <Badge variant="secondary" className="text-xs">
              {columns[status].length}
            </Badge>
          </div>
          <div className="min-h-[200px] space-y-2 rounded-xl border border-dashed border-border bg-muted/30 p-3">
            {columns[status].map((q) => (
              <div
                key={q.id}
                className="group rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
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
                  <p className="mt-1.5 text-[10px] text-muted-foreground">via {q.source}</p>
                )}
              </div>
            ))}
            {columns[status].length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">Aucune question</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Loading skeleton for generate ───────────────────────

function GeneratingSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4">
          <Skeleton className="mb-2 h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main component ──────────────────────────────────────

export function ExplorationClient({
  paths: initialPaths,
  projectName,
}: {
  paths: ExplorationPathData[]
  projectName: string
}) {
  const [paths, setPaths] = useState(initialPaths)
  const [activeView, setActiveView] = useState("category")
  const [isGenerating, setIsGenerating] = useState(false)

  const allQuestions = useMemo(() => paths.flatMap((p) => p.questions), [paths])
  const acceptedCount = allQuestions.filter((q) => q.status === "ACCEPTED").length
  const openCount = allQuestions.filter((q) => q.status === "OPEN").length
  const rejectedCount = allQuestions.filter((q) => q.status === "REJECTED").length

  const updateQuestionStatus = useCallback((id: string, newStatus: QuestionStatus) => {
    setPaths((prev) =>
      prev.map((p) => ({
        ...p,
        questions: p.questions.map((q) => (q.id === id ? { ...q, status: newStatus } : q)),
      })),
    )
  }, [])

  const handleAccept = useCallback(
    (id: string) => updateQuestionStatus(id, "ACCEPTED"),
    [updateQuestionStatus],
  )
  const handleReject = useCallback(
    (id: string) => updateQuestionStatus(id, "REJECTED"),
    [updateQuestionStatus],
  )

  const handleAdd = useCallback((pathId: string, text: string) => {
    const newQuestion: QuestionData = {
      id: `local-${Date.now()}`,
      question: text,
      priority: "MEDIUM",
      status: "OPEN",
      source: "Manuel",
      relatedDocs: [],
    }
    setPaths((prev) =>
      prev.map((p) =>
        p.id === pathId ? { ...p, questions: [...p.questions, newQuestion] } : p,
      ),
    )
  }, [])

  const handleGenerate = useCallback(() => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      // Add generated questions to the first relevant path (PISTES_CADRAGE or first)
      setPaths((prev) => {
        const targetIdx = prev.findIndex((p) => p.category === "PISTES_CADRAGE")
        const idx = targetIdx >= 0 ? targetIdx : 0
        return prev.map((p, i) =>
          i === idx ? { ...p, questions: [...p.questions, ...GENERATED_QUESTIONS] } : p,
        )
      })
    }, 2000)
  }, [])

  if (paths.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pistes d&apos;exploration</h1>
          <p className="text-muted-foreground mt-1 text-sm">{projectName}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Compass className="text-muted-foreground size-12" />
          <p className="text-muted-foreground text-lg">Aucune piste d&apos;exploration</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pistes d&apos;exploration</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {acceptedCount} retenues · {openCount} à explorer · {rejectedCount} écartées —{" "}
            {projectName}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          <Sparkles className={cn("size-4", isGenerating && "animate-spin")} />
          {isGenerating ? "Génération..." : "Générer de nouvelles pistes"}
        </Button>
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
            {isGenerating && <GeneratingSkeleton />}
            <AnimatePresence>
              {!isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CategoryView
                    paths={paths}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onAdd={handleAdd}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="checklist" className="mt-6">
            <ChecklistView paths={paths} onAccept={handleAccept} onReject={handleReject} />
          </TabsContent>

          <TabsContent value="board" className="mt-6">
            <BoardView paths={paths} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
