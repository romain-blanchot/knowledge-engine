"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"
import {
  Search,
  FileText,
  ArrowUpDown,
  FolderOpen,
  Database,
  CircleDot,
  AlertTriangle,
  Tag,
  Calendar,
  User,
  Layers,
  ChevronRight,
  PanelRightOpen,
  X,
} from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface DocumentSection {
  id: string
  title: string
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

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  BUSINESS_CONTEXT: FolderOpen,
  COMPANY_KNOWLEDGE: Database,
  CAHIER_DES_CHARGES: FileText,
  SFD: Layers,
  API_DOCUMENTATION: CircleDot,
  TECHNICAL_NOTES: FileText,
  ARCHITECTURE_DECISIONS: Layers,
  OPEN_QUESTIONS: AlertTriangle,
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

const ALL_CATEGORIES = [
  "BUSINESS_CONTEXT",
  "COMPANY_KNOWLEDGE",
  "CAHIER_DES_CHARGES",
  "SFD",
  "API_DOCUMENTATION",
  "TECHNICAL_NOTES",
  "ARCHITECTURE_DECISIONS",
  "OPEN_QUESTIONS",
] as const

type SortOption = "date" | "title" | "status"

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function KnowledgeClient({ documents }: { documents: SerializedDocument[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [selectedDocId, setSelectedDocId] = useState<string | null>(documents[0]?.id ?? null)
  const [mobileMetadataOpen, setMobileMetadataOpen] = useState(false)

  /* ---- Derived: category counts ---- */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const doc of documents) {
      counts[doc.category] = (counts[doc.category] ?? 0) + 1
    }
    return counts
  }, [documents])

  /* ---- Derived: filtered + sorted documents ---- */
  const filteredDocuments = useMemo(() => {
    let result = documents

    if (activeCategory) {
      result = result.filter((d) => d.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.author.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)) ||
          (d.summary?.toLowerCase().includes(q) ?? false),
      )
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title, "fr")
        case "status":
          return a.status.localeCompare(b.status)
        case "date":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

    return result
  }, [documents, activeCategory, searchQuery, sortBy])

  /* ---- Derived: selected document ---- */
  const selectedDoc = useMemo(
    () => documents.find((d) => d.id === selectedDocId) ?? filteredDocuments[0] ?? null,
    [documents, selectedDocId, filteredDocuments],
  )

  /* ---- Helpers ---- */
  const totalDocs = documents.length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Page header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight">Base de connaissances</h1>
        <p className="text-muted-foreground mt-1">
          {totalDocs} document{totalDocs !== 1 ? "s" : ""} disponible
          {totalDocs !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {/* Three-column layout */}
      <motion.div variants={item} className="flex gap-6">
        {/* ---------------------------------------------------------------- */}
        {/*  Left Column — Categories (hidden on mobile, shown as horizontal scroll) */}
        {/* ---------------------------------------------------------------- */}

        {/* Desktop sidebar */}
        <aside className="hidden w-[240px] shrink-0 lg:block">
          <div className="border-border bg-card rounded-xl border p-4">
            <h2 className="text-muted-foreground mb-3 text-sm font-semibold">Categories</h2>

            {/* All documents entry */}
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                activeCategory === null
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="size-4" />
                Tous les documents
              </span>
              <span className="font-mono text-xs">{totalDocs}</span>
            </button>

            <Separator className="my-2" />

            <div className="space-y-0.5">
              {ALL_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat] ?? FileText
                const count = categoryCounts[cat] ?? 0
                const isActive = activeCategory === cat

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(isActive ? null : cat)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{CATEGORY_LABELS[cat]}</span>
                    </span>
                    <span className="ml-2 font-mono text-xs">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Mobile horizontal categories */}
        <div className="absolute right-0 left-0 -mt-2 mb-2 overflow-x-auto px-6 lg:hidden">
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                activeCategory === null
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              Tous ({totalDocs})
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  activeCategory === cat
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {CATEGORY_LABELS[cat]} ({categoryCounts[cat] ?? 0})
              </button>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  Center — Document List                                          */}
        {/* ---------------------------------------------------------------- */}
        <div className="min-w-0 flex-1">
          {/* Search + sort bar */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Rechercher un document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="text-muted-foreground size-4" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger size="sm" className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date de mise a jour</SelectItem>
                  <SelectItem value="title">Titre</SelectItem>
                  <SelectItem value="status">Statut</SelectItem>
                </SelectContent>
              </Select>
              {/* Mobile metadata toggle */}
              <Button
                variant="outline"
                size="icon"
                className="xl:hidden"
                onClick={() => setMobileMetadataOpen(true)}
              >
                <PanelRightOpen className="size-4" />
              </Button>
            </div>
          </div>

          {/* Document rows */}
          {filteredDocuments.length === 0 ? (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center justify-center gap-3 py-16"
            >
              <FileText className="text-muted-foreground size-10" />
              <p className="text-muted-foreground text-sm">Aucun document trouve</p>
              {(searchQuery || activeCategory) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveCategory(null)
                  }}
                >
                  Reinitialiser les filtres
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredDocuments.map((doc) => (
                  <motion.div
                    key={doc.id}
                    variants={item}
                    layout
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                  >
                    <Link href={`/knowledge/${doc.id}`}>
                      <div
                        onMouseEnter={() => setSelectedDocId(doc.id)}
                        className={cn(
                          "group border-border bg-card hover:bg-accent/50 flex flex-col gap-2 rounded-xl border p-4 transition-colors",
                          selectedDocId === doc.id && "border-primary/30 bg-accent/30",
                        )}
                      >
                        {/* Row 1: Title + Status */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate font-medium">{doc.title}</h3>
                              <ChevronRight className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            {doc.summary && (
                              <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                                {doc.summary}
                              </p>
                            )}
                          </div>
                          <Badge
                            className={cn(
                              "shrink-0 border text-xs",
                              STATUS_CLASSES[doc.status] ?? "bg-muted text-muted-foreground",
                            )}
                          >
                            {STATUS_LABELS[doc.status] ?? doc.status}
                          </Badge>
                        </div>

                        {/* Row 2: Metadata */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs font-normal">
                            {CATEGORY_LABELS[doc.category] ?? doc.category}
                          </Badge>

                          {/* Special badges */}
                          {doc.ragIndexed && (
                            <Badge className="border-success/30 bg-success/15 text-success border text-xs font-normal">
                              Indexe RAG
                            </Badge>
                          )}
                          {doc.needsClarification && (
                            <Badge className="border-destructive/30 bg-destructive/15 text-destructive border text-xs font-normal">
                              Clarification requise
                            </Badge>
                          )}

                          <div className="flex-1" />

                          {/* Author + Date + Sections */}
                          <span className="text-muted-foreground text-xs">{doc.author}</span>
                          <Separator orientation="vertical" className="h-3" />
                          <span className="text-muted-foreground font-mono text-xs">
                            {format(new Date(doc.updatedAt), "dd MMM yyyy", { locale: fr })}
                          </span>
                          {doc.sectionsCount > 0 && (
                            <>
                              <Separator orientation="vertical" className="h-3" />
                              <span className="text-muted-foreground text-xs">
                                {doc.sectionsCount} section{doc.sectionsCount > 1 ? "s" : ""}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Row 3: Tags */}
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {doc.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  Right Column — Metadata Panel (desktop)                         */}
        {/* ---------------------------------------------------------------- */}
        <aside className="hidden w-[280px] shrink-0 xl:block">
          <MetadataPanel document={selectedDoc} />
        </aside>
      </motion.div>

      {/* Mobile metadata sheet */}
      <Sheet open={mobileMetadataOpen} onOpenChange={setMobileMetadataOpen}>
        <SheetContent side="right" className="w-[320px] overflow-y-auto p-0">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle>Metadonnees</SheetTitle>
            <SheetDescription>Details du document selectionne</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <MetadataPanel document={selectedDoc} />
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Metadata Panel                                                            */
/* -------------------------------------------------------------------------- */

function MetadataPanel({ document }: { document: SerializedDocument | null }) {
  if (!document) {
    return (
      <div className="border-border bg-card rounded-xl border p-6">
        <p className="text-muted-foreground text-sm">
          Survolez un document pour afficher ses metadonnees.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Document title */}
      <div className="border-border bg-card rounded-xl border p-4">
        <h3 className="mb-2 font-semibold">{document.title}</h3>
        <div className="flex flex-wrap gap-1.5">
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
        </div>
      </div>

      {/* Tags */}
      {document.tags.length > 0 && (
        <div className="border-border bg-card rounded-xl border p-4">
          <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
            <Tag className="size-3.5" />
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

      {/* Author & Dates */}
      <div className="border-border bg-card rounded-xl border p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="text-muted-foreground size-3.5" />
            <span className="text-muted-foreground text-sm">Auteur</span>
          </div>
          <p className="text-sm font-medium">{document.author}</p>

          <Separator />

          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground size-3.5" />
            <span className="text-muted-foreground text-sm">Dates</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cree le</span>
              <span className="font-mono text-xs">
                {format(new Date(document.createdAt), "dd MMM yyyy", { locale: fr })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mis a jour le</span>
              <span className="font-mono text-xs">
                {format(new Date(document.updatedAt), "dd MMM yyyy", { locale: fr })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections count */}
      <div className="border-border bg-card rounded-xl border p-4">
        <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <Layers className="size-3.5" />
          Sections
        </div>
        <p className="mt-1 font-mono text-2xl font-bold">{document.sectionsCount}</p>
        {document.sections.length > 0 && (
          <div className="mt-2 space-y-1">
            {document.sections.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className={cn(
                  "truncate rounded px-2 py-1 text-xs",
                  s.highlighted
                    ? "border-primary bg-primary/5 text-foreground border-l-2"
                    : "text-muted-foreground",
                )}
              >
                {s.title}
              </div>
            ))}
            {document.sections.length > 5 && (
              <p className="text-muted-foreground px-2 text-xs">
                +{document.sections.length - 5} autre{document.sections.length - 5 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Related documents (mock) */}
      <div className="border-border bg-card rounded-xl border p-4">
        <h4 className="text-muted-foreground mb-2 text-sm font-medium">Documents lies</h4>
        <div className="space-y-1.5">
          <div className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors">
            <FileText className="text-muted-foreground size-3.5" />
            <span className="truncate">Cahier des charges v2.1</span>
          </div>
          <div className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors">
            <FileText className="text-muted-foreground size-3.5" />
            <span className="truncate">Architecture technique</span>
          </div>
          <div className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors">
            <FileText className="text-muted-foreground size-3.5" />
            <span className="truncate">Regles metier paiements</span>
          </div>
        </div>
      </div>

      {/* Related APIs (mock) */}
      <div className="border-border bg-card rounded-xl border p-4">
        <h4 className="text-muted-foreground mb-2 text-sm font-medium">APIs liees</h4>
        <div className="space-y-1.5">
          <div className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors">
            <CircleDot className="text-muted-foreground size-3.5" />
            <span className="truncate">POST /api/documents</span>
          </div>
          <div className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors">
            <CircleDot className="text-muted-foreground size-3.5" />
            <span className="truncate">GET /api/knowledge/search</span>
          </div>
        </div>
      </div>
    </div>
  )
}
