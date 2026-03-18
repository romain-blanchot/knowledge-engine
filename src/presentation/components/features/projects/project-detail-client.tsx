"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale/fr"
import {
  ArrowLeft,
  FileText,
  Globe,
  Landmark,
  MessageSquare,
  BarChart3,
  Compass,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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

const DECISION_STATUS_CLASSES: Record<string, string> = {
  APPROVED: "bg-success/15 text-success border-success/30",
  PENDING: "bg-warning/15 text-warning border-warning/30",
  REJECTED: "bg-destructive/15 text-destructive border-destructive/30",
  SUPERSEDED: "bg-muted text-muted-foreground border-border",
}

const DECISION_STATUS_LABELS: Record<string, string> = {
  APPROVED: "Approuvée",
  PENDING: "En attente",
  REJECTED: "Rejetée",
  SUPERSEDED: "Remplacée",
}

const METHOD_CLASSES: Record<string, string> = {
  GET: "text-success",
  POST: "text-info",
  PUT: "text-warning",
  PATCH: "text-warning",
  DELETE: "text-destructive",
}

interface ProjectDetailData {
  id: string
  name: string
  client: string
  description: string
  status: string
  industry: string
  completionScore: number
  lastActivity: string
  createdAt: string
  counts: {
    documents: number
    apiEndpoints: number
    decisions: number
    conversations: number
    analyses: number
    explorations: number
  }
  recentDocuments: {
    id: string
    title: string
    category: string
    status: string
    ragIndexed: boolean
  }[]
  recentApiEndpoints: {
    id: string
    method: string
    route: string
    service: string
  }[]
  recentDecisions: {
    id: string
    title: string
    status: string
    author: string
  }[]
  recentConversations: {
    id: string
    title: string
    createdAt: string
  }[]
  recentAnalyses: {
    id: string
    title: string
    feature: string
    complexityScore: number
  }[]
  recentActivities: {
    id: string
    type: string
    description: string
    createdAt: string
  }[]
}

const SECTION_NAV = [
  { label: "Documents", icon: FileText, countKey: "documents" as const },
  { label: "Endpoints API", icon: Globe, countKey: "apiEndpoints" as const },
  { label: "Décisions", icon: Landmark, countKey: "decisions" as const },
  { label: "Conversations", icon: MessageSquare, countKey: "conversations" as const },
  { label: "Analyses", icon: BarChart3, countKey: "analyses" as const },
  { label: "Explorations", icon: Compass, countKey: "explorations" as const },
]

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

export function ProjectDetailClient({ data }: { data: ProjectDetailData }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Back link + header */}
      <motion.div variants={item}>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/projects">
            <ArrowLeft className="size-4" />
            Retour aux projets
          </Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
              <Badge
                className={cn(
                  "border text-xs",
                  STATUS_CLASSES[data.status] ?? "bg-muted text-muted-foreground",
                )}
              >
                {STATUS_LABELS[data.status] ?? data.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {data.client} — <span className="text-sm">{data.industry}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-3">
              <div className="bg-muted h-2.5 w-32 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${data.completionScore}%` }}
                />
              </div>
              <span className="font-mono text-sm font-semibold">{data.completionScore}%</span>
            </div>
            <span className="text-muted-foreground text-xs">
              Dernière activité{" "}
              {formatDistanceToNow(new Date(data.lastActivity), {
                locale: fr,
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          {data.description}
        </p>
        <Separator className="my-4" />
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Créé{" "}
            {formatDistanceToNow(new Date(data.createdAt), {
              locale: fr,
              addSuffix: true,
            })}
          </span>
        </div>
      </motion.div>

      {/* Section navigation cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {SECTION_NAV.map((section, index) => (
          <motion.div
            key={section.countKey}
            variants={item}
            custom={index}
            className="group border-border bg-card hover:border-primary/50 cursor-pointer rounded-xl border p-4 text-center transition-colors"
          >
            <section.icon className="text-muted-foreground group-hover:text-primary mx-auto size-5" />
            <p className="mt-2 font-mono text-2xl font-bold">{data.counts[section.countKey]}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{section.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent documents */}
        <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Documents récents</h3>
            <span className="text-muted-foreground font-mono text-xs">
              {data.counts.documents} au total
            </span>
          </div>
          {data.recentDocuments.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun document.</p>
          ) : (
            <div className="space-y-2.5">
              {data.recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="hover:bg-accent flex items-center justify-between rounded-lg p-2 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {doc.ragIndexed ? (
                      <CheckCircle2 className="text-success size-4 flex-shrink-0" />
                    ) : (
                      <Circle className="text-muted-foreground size-4 flex-shrink-0" />
                    )}
                    <span className="truncate text-sm">{doc.title}</span>
                  </div>
                  <Badge variant="outline" className="ml-2 flex-shrink-0 text-xs">
                    {doc.category.replace(/_/g, " ")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent API endpoints */}
        <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Endpoints API récents</h3>
            <span className="text-muted-foreground font-mono text-xs">
              {data.counts.apiEndpoints} au total
            </span>
          </div>
          {data.recentApiEndpoints.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun endpoint.</p>
          ) : (
            <div className="space-y-2.5">
              {data.recentApiEndpoints.map((api) => (
                <div
                  key={api.id}
                  className="hover:bg-accent flex items-center gap-3 rounded-lg p-2 transition-colors"
                >
                  <span
                    className={cn(
                      "w-14 flex-shrink-0 text-center font-mono text-xs font-bold",
                      METHOD_CLASSES[api.method] ?? "text-muted-foreground",
                    )}
                  >
                    {api.method}
                  </span>
                  <span className="truncate font-mono text-sm">{api.route}</span>
                  <span className="text-muted-foreground ml-auto flex-shrink-0 text-xs">
                    {api.service}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent decisions */}
        <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Décisions récentes</h3>
            <span className="text-muted-foreground font-mono text-xs">
              {data.counts.decisions} au total
            </span>
          </div>
          {data.recentDecisions.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune décision.</p>
          ) : (
            <div className="space-y-2.5">
              {data.recentDecisions.map((dec) => (
                <div
                  key={dec.id}
                  className="hover:bg-accent flex items-center justify-between rounded-lg p-2 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{dec.title}</p>
                    <p className="text-muted-foreground text-xs">{dec.author}</p>
                  </div>
                  <Badge
                    className={cn(
                      "ml-2 flex-shrink-0 border text-xs",
                      DECISION_STATUS_CLASSES[dec.status] ?? "bg-muted text-muted-foreground",
                    )}
                  >
                    {DECISION_STATUS_LABELS[dec.status] ?? dec.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
          <h3 className="mb-4 text-lg font-semibold">Activité récente</h3>
          {data.recentActivities.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune activité.</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivities.map((activity) => (
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

        {/* Recent conversations */}
        <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Conversations récentes</h3>
            <span className="text-muted-foreground font-mono text-xs">
              {data.counts.conversations} au total
            </span>
          </div>
          {data.recentConversations.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune conversation.</p>
          ) : (
            <div className="space-y-2.5">
              {data.recentConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="group hover:bg-accent flex items-center justify-between rounded-lg p-2 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <MessageSquare className="text-muted-foreground size-4 flex-shrink-0" />
                    <span className="truncate text-sm">{conv.title}</span>
                  </div>
                  <span className="text-muted-foreground ml-2 flex-shrink-0 font-mono text-xs">
                    {formatDistanceToNow(new Date(conv.createdAt), {
                      locale: fr,
                      addSuffix: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent analyses */}
        <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Analyses récentes</h3>
            <span className="text-muted-foreground font-mono text-xs">
              {data.counts.analyses} au total
            </span>
          </div>
          {data.recentAnalyses.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune analyse.</p>
          ) : (
            <div className="space-y-2.5">
              {data.recentAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="group hover:bg-accent flex items-center justify-between rounded-lg p-2 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{analysis.title}</p>
                    <p className="text-muted-foreground text-xs">{analysis.feature}</p>
                  </div>
                  <div className="ml-2 flex flex-shrink-0 items-center gap-1.5">
                    <BarChart3 className="text-muted-foreground size-3.5" />
                    <span className="text-muted-foreground font-mono text-xs">
                      {analysis.complexityScore}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
