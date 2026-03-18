"use client"

import { motion } from "framer-motion"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"
import Link from "next/link"
import {
  Layers,
  Server,
  Monitor,
  Database,
  Shield,
  TestTube,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  Download,
  ListChecks,
  GitCompare,
  Globe,
  FileCode2,
  FileText,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

interface ImpactSection {
  summary?: string
  items?: string[]
}

interface ImpactAnalysisDetail {
  id: string
  title: string
  feature: string
  complexityScore: number
  confidenceScore: number
  functionalImpact: unknown
  backendImpact: unknown
  frontendImpact: unknown
  dataImpact: unknown
  securityImpact: unknown
  testingImpact: unknown
  risks: unknown
  recommendations: unknown
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-sm font-bold">{value}/100</span>
      </div>
      <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

const SECTION_CONFIG = [
  { key: "functionalImpact", label: "Impact fonctionnel", icon: Layers, color: "text-blue-500" },
  { key: "backendImpact", label: "Impact Backend", icon: Server, color: "text-emerald-500" },
  { key: "frontendImpact", label: "Impact Frontend", icon: Monitor, color: "text-purple-500" },
  { key: "dataImpact", label: "Impact Données", icon: Database, color: "text-amber-500" },
  { key: "securityImpact", label: "Sécurité / Permissions", icon: Shield, color: "text-red-500" },
  { key: "testingImpact", label: "Impact Tests", icon: TestTube, color: "text-cyan-500" },
  {
    key: "risks",
    label: "Risques / Ambiguïtés",
    icon: AlertTriangle,
    color: "text-orange-500",
  },
  {
    key: "recommendations",
    label: "Recommandations",
    icon: Lightbulb,
    color: "text-yellow-500",
  },
] as const

function ImpactSectionCard({
  data,
  label,
  icon: Icon,
  color,
}: {
  data: unknown
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  if (!data) return null

  const section = data as ImpactSection

  return (
    <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className={cn("bg-muted rounded-lg p-2", color)}>
          <Icon className="size-5" />
        </div>
        <h3 className="text-lg font-medium">{label}</h3>
      </div>

      {section.summary && (
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed italic">
          {section.summary}
        </p>
      )}

      {section.items && section.items.length > 0 && (
        <ul className="space-y-2">
          {section.items.map((text, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <span className="bg-primary mt-2 inline-block size-1.5 shrink-0 rounded-full" />
              {text}
            </li>
          ))}
        </ul>
      )}

      {!section.summary && (!section.items || section.items.length === 0) && (
        <div className="bg-muted rounded-lg p-4 font-mono text-xs">
          <pre className="overflow-x-auto break-all whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </motion.div>
  )
}

export function ImpactDetailClient({ analysis }: { analysis: ImpactAnalysisDetail }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Back link */}
      <motion.div variants={item}>
        <Link
          href="/impact"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Retour aux analyses
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{analysis.title}</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{analysis.feature}</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ScoreBar value={analysis.complexityScore} label="Complexité" variant="complexity" />
          <ScoreBar value={analysis.confidenceScore} label="Confiance" variant="confidence" />
        </div>

        <p className="text-muted-foreground mt-4 text-xs">
          Générée le {format(new Date(analysis.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
        </p>
      </motion.div>

      {/* Impact sections */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {SECTION_CONFIG.map((cfg) => (
          <ImpactSectionCard
            key={cfg.key}
            data={analysis[cfg.key]}
            label={cfg.label}
            icon={cfg.icon}
            color={cfg.color}
          />
        ))}
      </div>

      {/* Related items */}
      <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
        <h3 className="mb-4 text-lg font-medium">Éléments liés</h3>
        <div className="space-y-4">
          {analysis.sourceDocs.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                <FileText className="size-4" />
                Documents sources
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.sourceDocs.map((doc) => (
                  <Badge key={doc} variant="outline" className="text-xs">
                    {doc}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.impactedEndpoints.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                <Globe className="size-4" />
                Endpoints impactés
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.impactedEndpoints.map((ep) => (
                  <Badge key={ep} variant="secondary" className="font-mono text-xs">
                    {ep}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.impactedComponents.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                <FileCode2 className="size-4" />
                Composants impactés
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.impactedComponents.map((comp) => (
                  <Badge key={comp} variant="secondary" className="text-xs">
                    {comp}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        variants={item}
        className="border-border bg-card flex flex-wrap items-center gap-3 rounded-xl border p-6"
      >
        <Button variant="outline" className="gap-2" disabled>
          <Download className="size-4" />
          Exporter l&apos;analyse
        </Button>
        <Button variant="outline" className="gap-2" disabled>
          <ListChecks className="size-4" />
          Convertir en tâches
        </Button>
        <Button variant="outline" className="gap-2" disabled>
          <GitCompare className="size-4" />
          Comparer avec une analyse précédente
        </Button>
      </motion.div>
    </motion.div>
  )
}
