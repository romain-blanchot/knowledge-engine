"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"
import { Landmark, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

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

type DecisionStatus = "APPROVED" | "PENDING" | "REJECTED" | "SUPERSEDED"

interface DecisionData {
  id: string
  title: string
  context: string
  justification: string
  impact: string
  author: string
  status: DecisionStatus
  relatedDocs: string[]
  relatedApis: string[]
  createdAt: string
}

const STATUS_CONFIG: Record<
  DecisionStatus,
  { label: string; dotColor: string; badgeClass: string }
> = {
  APPROVED: {
    label: "Approuvée",
    dotColor: "bg-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-500",
  },
  PENDING: {
    label: "En attente",
    dotColor: "bg-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-500",
  },
  REJECTED: {
    label: "Rejetée",
    dotColor: "bg-red-500",
    badgeClass: "bg-red-500/10 text-red-500",
  },
  SUPERSEDED: {
    label: "Remplacée",
    dotColor: "bg-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground",
  },
}

function DecisionSheet({
  decision,
  open,
  onOpenChange,
}: {
  decision: DecisionData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!decision) return null
  const cfg = STATUS_CONFIG[decision.status]
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-lg leading-snug">{decision.title}</SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <Badge className={cn("text-xs", cfg.badgeClass)} variant="outline">
              {cfg.label}
            </Badge>
            <span className="text-muted-foreground text-xs">
              {decision.author} —{" "}
              {format(new Date(decision.createdAt), "d MMMM yyyy", { locale: fr })}
            </span>
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Contexte</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{decision.context}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium">Justification</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {decision.justification}
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium">Impact</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{decision.impact}</p>
          </div>
          {decision.relatedDocs.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Documents liés</p>
                <div className="flex flex-wrap gap-1.5">
                  {decision.relatedDocs.map((doc) => (
                    <Badge key={doc} variant="outline" className="text-xs">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          {decision.relatedApis.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">APIs liées</p>
                <div className="flex flex-wrap gap-1.5">
                  {decision.relatedApis.map((api) => (
                    <Badge key={api} variant="secondary" className="font-mono text-xs">
                      {api}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function TimelineView({
  decisions,
  onSelect,
}: {
  decisions: DecisionData[]
  onSelect: (d: DecisionData) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="border-border relative ml-4 space-y-0 border-l-2 pl-8">
      {decisions.map((d, index) => {
        const cfg = STATUS_CONFIG[d.status]
        const isExpanded = expandedId === d.id
        return (
          <motion.div key={d.id} variants={item} custom={index} className="relative pb-8 last:pb-0">
            {/* Dot on timeline */}
            <div
              className={cn(
                "border-background absolute top-1 -left-[calc(2rem+5px)] size-3 rounded-full border-2",
                cfg.dotColor,
              )}
            />
            {/* Date on line */}
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              {format(new Date(d.createdAt), "d MMMM yyyy", { locale: fr })}
            </p>
            {/* Card */}
            <div
              className="border-border bg-card hover:border-primary/30 cursor-pointer rounded-xl border p-5 transition-all hover:shadow-sm"
              onClick={() => onSelect(d)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="leading-snug font-semibold">{d.title}</h4>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className={cn("text-xs", cfg.badgeClass)} variant="outline">
                      {cfg.label}
                    </Badge>
                    <span className="text-muted-foreground text-xs">{d.author}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedId(isExpanded ? null : d.id)
                  }}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md p-1 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </button>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <Separator className="my-3" />
                    <div className="space-y-3">
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">Contexte</p>
                        <p className="mt-1 text-sm leading-relaxed">{d.context}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">Justification</p>
                        <p className="mt-1 text-sm leading-relaxed">{d.justification}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function TableView({
  decisions,
  onSelect,
  sortField,
  sortDir,
  onSort,
}: {
  decisions: DecisionData[]
  onSelect: (d: DecisionData) => void
  sortField: "createdAt" | "status"
  sortDir: "asc" | "desc"
  onSort: (field: "createdAt" | "status") => void
}) {
  return (
    <div className="border-border bg-card rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Décision</TableHead>
            <TableHead>
              <button
                onClick={() => onSort("status")}
                className="inline-flex items-center gap-1 font-medium"
              >
                Statut
                {sortField === "status" && (
                  <span className="text-xs">{sortDir === "asc" ? "↑" : "↓"}</span>
                )}
              </button>
            </TableHead>
            <TableHead>Auteur</TableHead>
            <TableHead>
              <button
                onClick={() => onSort("createdAt")}
                className="inline-flex items-center gap-1 font-medium"
              >
                Date
                {sortField === "createdAt" && (
                  <span className="text-xs">{sortDir === "asc" ? "↑" : "↓"}</span>
                )}
              </button>
            </TableHead>
            <TableHead>Impact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {decisions.map((d) => {
            const cfg = STATUS_CONFIG[d.status]
            return (
              <TableRow key={d.id} className="cursor-pointer" onClick={() => onSelect(d)}>
                <TableCell className="font-medium">{d.title}</TableCell>
                <TableCell>
                  <Badge className={cn("text-xs", cfg.badgeClass)} variant="outline">
                    {cfg.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{d.author}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(d.createdAt), "d MMM yyyy", { locale: fr })}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {d.impact}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function DecisionsClient({
  decisions,
  projectName,
}: {
  decisions: DecisionData[]
  projectName: string
}) {
  const [selectedDecision, setSelectedDecision] = useState<DecisionData | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sortField, setSortField] = useState<"createdAt" | "status">("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  function handleSelect(d: DecisionData) {
    setSelectedDecision(d)
    setSheetOpen(true)
  }

  function handleSort(field: "createdAt" | "status") {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const sortedDecisions = [...decisions].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1
    if (sortField === "createdAt") {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
    }
    return a.status.localeCompare(b.status) * dir
  })

  if (decisions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Journal des décisions</h1>
          <p className="text-muted-foreground mt-1 text-sm">{projectName}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Landmark className="text-muted-foreground size-12" />
          <p className="text-muted-foreground text-lg">Aucune décision enregistrée</p>
          <p className="text-muted-foreground text-sm">
            Les décisions d&apos;architecture apparaîtront ici une fois documentées.
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold tracking-tight">Journal des décisions</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {decisions.length} décision{decisions.length !== 1 ? "s" : ""} — {projectName}
        </p>
      </motion.div>

      {/* Views */}
      <motion.div variants={item}>
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="tableau">Tableau</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <TimelineView decisions={decisions} onSelect={handleSelect} />
          </TabsContent>

          <TabsContent value="tableau" className="mt-6">
            <TableView
              decisions={sortedDecisions}
              onSelect={handleSelect}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Detail sheet */}
      <DecisionSheet decision={selectedDecision} open={sheetOpen} onOpenChange={setSheetOpen} />
    </motion.div>
  )
}
