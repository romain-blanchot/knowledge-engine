"use client"

import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale/fr"
import {
  FileText,
  Globe,
  HelpCircle,
  Landmark,
  BarChart3,
  MessageSquare,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileSearch,
} from "lucide-react"

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

interface ActivityItem {
  id: string
  type: string
  description: string
  createdAt: string
}

interface DashboardData {
  project: {
    id: string
    name: string
    client: string
    description: string
    status: string
    completionScore: number
    lastActivity: string
  } | null
  kpis: {
    documentsIndexed: number
    apiEndpoints: number
    openQuestions: number
    decisions: number
    analyses: number
    conversations: number
  }
  recentActivities: ActivityItem[]
  lastSyncDate: string | null
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

const ACTIVITY_COLORS: Record<string, string> = {
  document_added: "bg-info",
  document_indexed: "bg-success",
  question_asked: "bg-primary",
  analysis_generated: "bg-warning",
  decision_made: "bg-success",
  api_documented: "bg-info",
  rag_sync: "bg-primary",
  ring_update: "bg-primary",
}

const KPI_CONFIG = [
  {
    key: "documentsIndexed" as const,
    label: "Documents indexés",
    icon: FileText,
    color: "text-info",
  },
  { key: "apiEndpoints" as const, label: "Endpoints API", icon: Globe, color: "text-chart-4" },
  {
    key: "openQuestions" as const,
    label: "Questions ouvertes",
    icon: HelpCircle,
    color: "text-warning",
  },
  {
    key: "decisions" as const,
    label: "Décisions d'architecture",
    icon: Landmark,
    color: "text-success",
  },
  { key: "analyses" as const, label: "Analyses générées", icon: BarChart3, color: "text-chart-5" },
  {
    key: "conversations" as const,
    label: "Conversations",
    icon: MessageSquare,
    color: "text-primary",
  },
]

const SUGGESTED_ACTIONS = [
  {
    icon: AlertTriangle,
    text: "Clarifier les divergences CDC/SFD sur les paiements",
  },
  {
    icon: FileSearch,
    text: "Compléter la documentation API du service carte cadeau",
  },
  {
    icon: CheckCircle2,
    text: "Valider les décisions d'architecture en attente",
  },
  {
    icon: Sparkles,
    text: "Lancer une analyse d'impact sur le module fidélité",
  },
]

export function DashboardClient({ data }: { data: DashboardData }) {
  const { project, kpis, recentActivities, lastSyncDate } = data

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <FileText className="text-muted-foreground size-12" />
        <p className="text-muted-foreground text-lg">Aucun projet actif</p>
        <p className="text-muted-foreground text-sm">Créez un nouveau projet pour commencer.</p>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Page header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Projet <span className="text-foreground font-medium">{project.name}</span> —{" "}
          {project.client}
        </p>
      </motion.div>

      {/* Project overview card */}
      <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{project.name}</h2>
              <Badge
                className={cn(
                  "border text-xs",
                  STATUS_CLASSES[project.status] ?? "bg-muted text-muted-foreground",
                )}
              >
                {STATUS_LABELS[project.status] ?? project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{project.client}</p>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              {project.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-muted-foreground text-xs">Complétion</span>
            <div className="flex items-center gap-3">
              <div className="bg-muted h-2.5 w-32 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${project.completionScore}%` }}
                />
              </div>
              <span className="font-mono text-sm font-semibold">{project.completionScore}%</span>
            </div>
            <span className="text-muted-foreground mt-1 text-xs">
              Dernière activité{" "}
              {formatDistanceToNow(new Date(project.lastActivity), {
                locale: fr,
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KPI_CONFIG.map((kpi, index) => (
          <motion.div
            key={kpi.key}
            variants={item}
            custom={index}
            className="border-border bg-card rounded-xl border p-6"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">{kpi.label}</p>
                <p className="font-mono text-3xl font-bold">{kpis[kpi.key]}</p>
              </div>
              <div className={cn("bg-primary/10 rounded-lg p-2.5", kpi.color)}>
                <kpi.icon className="size-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two columns: Activity + Ring/Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column — Recent activity */}
        <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
          <h3 className="mb-4 text-lg font-semibold">Activité récente</h3>
          {recentActivities.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune activité enregistrée.</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1.5 flex-shrink-0">
                    <div
                      className={cn(
                        "size-2.5 rounded-full",
                        ACTIVITY_COLORS[activity.type] ?? "bg-muted-foreground",
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{activity.description}</p>
                    <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        locale: fr,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Ring & RAG Status */}
          <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
            <h3 className="mb-4 text-lg font-semibold">Statut Ring & RAG</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-success size-2.5 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Ring Context</p>
                  <p className="text-muted-foreground text-xs">
                    Actif — {kpis.documentsIndexed} docs liés
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-success size-2.5 rounded-full" />
                <div>
                  <p className="text-sm font-medium">RAG Pipeline</p>
                  <p className="text-muted-foreground text-xs">
                    Indexé — {kpis.documentsIndexed} sources
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-muted-foreground size-4" />
                <div>
                  <p className="text-sm font-medium">Dernière sync</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {lastSyncDate
                      ? formatDistanceToNow(new Date(lastSyncDate), {
                          locale: fr,
                          addSuffix: true,
                        })
                      : "Aucune synchronisation"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Suggested actions */}
          <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
            <h3 className="mb-4 text-lg font-semibold">Actions suggérées</h3>
            <div className="space-y-2.5">
              {SUGGESTED_ACTIONS.map((action, index) => (
                <div
                  key={index}
                  className="group hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-colors"
                >
                  <action.icon className="text-muted-foreground size-4 flex-shrink-0" />
                  <p className="flex-1 text-sm">{action.text}</p>
                  <ArrowRight className="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
