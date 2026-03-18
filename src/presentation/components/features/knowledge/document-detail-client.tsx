"use client"

import { motion } from "framer-motion"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"
import {
  ArrowLeft,
  FileText,
  Tag,
  Calendar,
  User,
  Layers,
  CircleDot,
  Database,
  AlertTriangle,
  MessageSquare,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface DocumentSection {
  id: string
  title: string
  content: string
  order: number
  highlighted: boolean
}

interface SerializedDocument {
  id: string
  title: string
  category: string
  status: string
  summary: string | null
  content: string | null
  author: string
  tags: string[]
  ragIndexed: boolean
  needsClarification: boolean
  sectionsCount: number
  sections: DocumentSection[]
  createdAt: string
  updatedAt: string
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const CATEGORY_LABELS: Record<string, string> = {
  BUSINESS_CONTEXT: "Contexte metier",
  COMPANY_KNOWLEDGE: "Connaissance entreprise",
  CAHIER_DES_CHARGES: "Cahier des charges",
  SFD: "Specifications fonctionnelles",
  API_DOCUMENTATION: "Documentation API",
  TECHNICAL_NOTES: "Notes techniques",
  ARCHITECTURE_DECISIONS: "Decisions d'architecture",
  OPEN_QUESTIONS: "Questions ouvertes",
}

const STATUS_LABELS: Record<string, string> = {
  INDEXED: "Indexe",
  PENDING: "En attente",
  NEEDS_REVIEW: "A revoir",
  DRAFT: "Brouillon",
}

const STATUS_CLASSES: Record<string, string> = {
  INDEXED: "bg-success/15 text-success border-success/30",
  PENDING: "bg-warning/15 text-warning border-warning/30",
  NEEDS_REVIEW: "bg-destructive/15 text-destructive border-destructive/30",
  DRAFT: "bg-muted text-muted-foreground border-border",
}

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function DocumentDetailClient({ document }: { document: SerializedDocument }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Back button */}
      <motion.div variants={item}>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/knowledge" className="gap-2">
            <ArrowLeft className="size-4" />
            Retour a la base de connaissances
          </Link>
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div variants={item} className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">{document.title}</h1>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={cn(
              "border text-xs",
              STATUS_CLASSES[document.status] ?? "bg-muted text-muted-foreground",
            )}
          >
            {STATUS_LABELS[document.status] ?? document.status}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal">
            {CATEGORY_LABELS[document.category] ?? document.category}
          </Badge>

          {document.ragIndexed && (
            <Badge className="border-success/30 bg-success/15 text-success border text-xs font-normal">
              <Database className="mr-1 size-3" />
              Indexe RAG
            </Badge>
          )}
          {document.needsClarification && (
            <Badge className="border-destructive/30 bg-destructive/15 text-destructive border text-xs font-normal">
              <AlertTriangle className="mr-1 size-3" />
              Clarification requise
            </Badge>
          )}
        </div>

        {/* Author + Date */}
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5">
            <User className="size-3.5" />
            {document.author}
          </span>
          <Separator orientation="vertical" className="h-3" />
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            Mis a jour le {format(new Date(document.updatedAt), "dd MMMM yyyy", { locale: fr })}
          </span>
        </div>
      </motion.div>

      {/* Content area + sidebar */}
      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Summary card */}
          {document.summary && (
            <motion.div
              variants={item}
              className="border-primary/20 bg-primary/5 rounded-xl border p-6"
            >
              <h2 className="text-primary mb-2 text-sm font-semibold">Resume</h2>
              <p className="text-foreground text-sm leading-relaxed tracking-normal">
                {document.summary}
              </p>
            </motion.div>
          )}

          {/* Document content */}
          {document.content && (
            <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
              <p className="text-foreground/90 text-sm leading-relaxed tracking-normal whitespace-pre-wrap">
                {document.content}
              </p>
            </motion.div>
          )}

          {/* Sections */}
          {document.sections.length > 0 && (
            <motion.div variants={item} className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Layers className="text-muted-foreground size-5" />
                Sections ({document.sections.length})
              </h2>

              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {document.sections.map((section) => (
                  <motion.div
                    key={section.id}
                    variants={item}
                    className={cn(
                      "border-border bg-card rounded-xl border p-6 transition-colors",
                      section.highlighted && "border-l-primary border-l-4",
                    )}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-md font-mono text-xs font-medium">
                        {section.order}
                      </span>
                      <h3 className="font-medium">{section.title}</h3>
                      {section.highlighted && (
                        <Badge className="border-primary/30 bg-primary/10 text-primary border text-xs font-normal">
                          Important
                        </Badge>
                      )}
                    </div>
                    <p className="text-foreground/90 text-sm leading-relaxed tracking-normal whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Right sidebar (sticky) */}
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="sticky top-6 space-y-4">
            {/* Metadata card */}
            <div className="border-border bg-card rounded-xl border p-4">
              <h4 className="text-muted-foreground mb-3 text-sm font-semibold">Metadonnees</h4>

              {/* Tags */}
              {document.tags.length > 0 && (
                <div className="mb-3">
                  <div className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-xs">
                    <Tag className="size-3" />
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {document.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-3" />

              {/* Author */}
              <div className="mb-3">
                <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs">
                  <User className="size-3" />
                  Auteur
                </div>
                <p className="text-sm font-medium">{document.author}</p>
              </div>

              <Separator className="my-3" />

              {/* Dates */}
              <div className="mb-3">
                <div className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-xs">
                  <Calendar className="size-3" />
                  Dates
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creation</span>
                    <span className="font-mono text-xs">
                      {format(new Date(document.createdAt), "dd/MM/yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mise a jour</span>
                    <span className="font-mono text-xs">
                      {format(new Date(document.updatedAt), "dd/MM/yyyy", { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Sections count */}
              <div>
                <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs">
                  <Layers className="size-3" />
                  Sections
                </div>
                <p className="font-mono text-lg font-bold">{document.sectionsCount}</p>
              </div>
            </div>

            {/* Related documents (mock) */}
            <div className="border-border bg-card rounded-xl border p-4">
              <h4 className="text-muted-foreground mb-3 text-sm font-semibold">Documents lies</h4>
              <div className="space-y-1.5">
                <Link
                  href="#"
                  className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
                >
                  <FileText className="text-muted-foreground size-3.5" />
                  <span className="truncate">Cahier des charges v2.1</span>
                </Link>
                <Link
                  href="#"
                  className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
                >
                  <FileText className="text-muted-foreground size-3.5" />
                  <span className="truncate">Architecture technique</span>
                </Link>
                <Link
                  href="#"
                  className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
                >
                  <FileText className="text-muted-foreground size-3.5" />
                  <span className="truncate">Regles metier paiements</span>
                </Link>
              </div>
            </div>

            {/* Related APIs (mock) */}
            <div className="border-border bg-card rounded-xl border p-4">
              <h4 className="text-muted-foreground mb-3 text-sm font-semibold">APIs liees</h4>
              <div className="space-y-1.5">
                <Link
                  href="#"
                  className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
                >
                  <CircleDot className="text-muted-foreground size-3.5" />
                  <span className="truncate font-mono text-xs">POST /api/documents</span>
                </Link>
                <Link
                  href="#"
                  className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
                >
                  <CircleDot className="text-muted-foreground size-3.5" />
                  <span className="truncate font-mono text-xs">GET /api/knowledge/search</span>
                </Link>
                <Link
                  href="#"
                  className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
                >
                  <CircleDot className="text-muted-foreground size-3.5" />
                  <span className="truncate font-mono text-xs">PUT /api/documents/:id</span>
                </Link>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" size="sm">
                <MessageSquare className="size-4" />
                Interroger l&apos;assistant sur ce document
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" size="sm">
                <Sparkles className="size-4" />
                Generer une analyse d&apos;impact
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  )
}
