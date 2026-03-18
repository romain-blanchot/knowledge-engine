"use client"

import { motion } from "framer-motion"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"
import { BarChart3, ArrowRight, Globe, FileCode2, FileText, TrendingUp } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

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

interface ImpactAnalysisData {
  id: string
  title: string
  feature: string
  complexityScore: number
  confidenceScore: number
  sourceDocs: string[]
  impactedEndpoints: string[]
  impactedComponents: string[]
  createdAt: string
}

function ScoreBar({
  value,
  label,
  variant,
}: {
  value: number
  label: string
  variant: "complexity" | "confidence"
}) {
  const barColor =
    variant === "complexity"
      ? value < 40
        ? "bg-emerald-500"
        : value < 70
          ? "bg-amber-500"
          : "bg-red-500"
      : "bg-primary"

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="font-mono text-xs font-semibold">{value}/100</span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function ImpactClient({
  analyses,
  projectName,
}: {
  analyses: ImpactAnalysisData[]
  projectName: string
}) {
  if (analyses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analyses d&apos;impact</h1>
          <p className="text-muted-foreground mt-1 text-sm">{projectName}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <BarChart3 className="text-muted-foreground size-12" />
          <p className="text-muted-foreground text-lg">Aucune analyse d&apos;impact</p>
          <p className="text-muted-foreground text-sm">
            Les analyses apparaîtront ici une fois générées par l&apos;assistant.
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold tracking-tight">Analyses d&apos;impact</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {analyses.length} analyse{analyses.length !== 1 ? "s" : ""} — {projectName}
        </p>
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {analyses.map((analysis) => (
          <motion.div key={analysis.id} variants={item}>
            <Link href={`/impact/${analysis.id}`} className="group block">
              <div className="border-border bg-card hover:border-primary/30 rounded-xl border p-6 transition-all hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="group-hover:text-primary leading-snug font-semibold transition-colors">
                      {analysis.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                      {analysis.feature}
                    </p>
                  </div>
                  <ArrowRight className="text-muted-foreground mt-1 size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                {/* Scores */}
                <div className="mt-4 space-y-2.5">
                  <ScoreBar
                    value={analysis.complexityScore}
                    label="Complexité"
                    variant="complexity"
                  />
                  <ScoreBar
                    value={analysis.confidenceScore}
                    label="Confiance"
                    variant="confidence"
                  />
                </div>

                {/* Counts */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <Globe className="size-3.5" />
                    <span>
                      {analysis.impactedEndpoints.length} endpoint
                      {analysis.impactedEndpoints.length !== 1 ? "s" : ""} impacté
                      {analysis.impactedEndpoints.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <FileCode2 className="size-3.5" />
                    <span>
                      {analysis.impactedComponents.length} composant
                      {analysis.impactedComponents.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <FileText className="size-3.5" />
                    <span>
                      {analysis.sourceDocs.length} doc
                      {analysis.sourceDocs.length !== 1 ? "s" : ""} source
                      {analysis.sourceDocs.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="border-border mt-4 flex items-center gap-2 border-t pt-4">
                  <TrendingUp className="text-muted-foreground size-3.5" />
                  <span className="text-muted-foreground text-xs">
                    Générée le {format(new Date(analysis.createdAt), "d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
