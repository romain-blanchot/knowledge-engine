"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"
import {
  Landmark,
  ChevronDown,
  ChevronUp,
  Keyboard,
  Mic,
  FileText,
  Sparkles,
  Upload,
  Square,
  Volume2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

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

type DecisionStatus = "APPROVED" | "PENDING" | "REJECTED" | "SUPERSEDED"
type DecisionInputType = "TEXT" | "AUDIO" | "FILE"

interface DecisionData {
  id: string
  title: string
  context: string
  justification: string
  impact: string
  author: string
  status: DecisionStatus
  inputType: DecisionInputType
  transcript: string | null
  synthesis: string | null
  relatedDocs: string[]
  createdAt: string
}

// ── Config ──────────────────────────────────────────────

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

const INPUT_TYPE_ICON: Record<DecisionInputType, React.ComponentType<{ className?: string }>> = {
  TEXT: Keyboard,
  AUDIO: Mic,
  FILE: FileText,
}

const INPUT_TYPE_LABEL: Record<DecisionInputType, string> = {
  TEXT: "Texte",
  AUDIO: "Audio",
  FILE: "Fichier",
}

// ── Audio waveform bars ─────────────────────────────────

function AudioWaveform({ isRecording }: { isRecording: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 py-6">
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-destructive"
          animate={
            isRecording
              ? {
                  height: [12, 32, 18, 40, 14, 28, 12],
                  transition: {
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse" as const,
                    delay: i * 0.1,
                  },
                }
              : { height: 4 }
          }
          style={{ height: 4 }}
        />
      ))}
    </div>
  )
}

// ── Record decision form ────────────────────────────────

const MOCK_TRANSCRIPT =
  "On a convenu avec le client que le module de fidélité serait intégré directement dans l'app de réservation plutôt que dans un outil séparé. Ça simplifie le parcours utilisateur et réduit les coûts de maintenance."
const MOCK_SYNTHESIS =
  "Le module de fidélité sera intégré à l'application de réservation principale, pour simplifier le parcours utilisateur et réduire les coûts."

function RecordDecisionForm({ onAdd }: { onAdd: (d: DecisionData) => void }) {
  const [title, setTitle] = useState("")
  const [context, setContext] = useState("")
  const [inputMode, setInputMode] = useState<DecisionInputType>("TEXT")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingPhase, setRecordingPhase] = useState<
    "idle" | "recording" | "transcribing" | "done"
  >("idle")
  const [transcript, setTranscript] = useState("")
  const [synthesis, setSynthesis] = useState("")
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsRecording(false)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setIsRecording(true)
      setRecordingPhase("recording")
      setTranscript("")
      setSynthesis("")

      // Auto-stop after 4 seconds
      timerRef.current = setTimeout(() => {
        stopRecording()
        setRecordingPhase("transcribing")

        // Simulate transcription
        setTimeout(() => {
          setTranscript(MOCK_TRANSCRIPT)
          setRecordingPhase("done")
        }, 1500)
      }, 4000)
    } catch {
      // Fallback if mic access denied — simulate anyway
      setIsRecording(true)
      setRecordingPhase("recording")
      setTranscript("")
      setSynthesis("")

      timerRef.current = setTimeout(() => {
        setIsRecording(false)
        setRecordingPhase("transcribing")
        setTimeout(() => {
          setTranscript(MOCK_TRANSCRIPT)
          setRecordingPhase("done")
        }, 1500)
      }, 3000)
    }
  }, [stopRecording])

  const handleStopManual = useCallback(() => {
    stopRecording()
    setRecordingPhase("transcribing")
    setTimeout(() => {
      setTranscript(MOCK_TRANSCRIPT)
      setRecordingPhase("done")
    }, 1500)
  }, [stopRecording])

  const handleSynthesize = () => {
    setIsSynthesizing(true)
    setTimeout(() => {
      setSynthesis(MOCK_SYNTHESIS)
      setIsSynthesizing(false)
    }, 1500)
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    const newDecision: DecisionData = {
      id: `local-${Date.now()}`,
      title: title.trim(),
      context: context.trim() || "Ajouté manuellement",
      justification: inputMode === "AUDIO" ? transcript : context.trim(),
      impact: "À évaluer",
      author: "Consultant",
      status: "PENDING",
      inputType: inputMode,
      transcript: inputMode === "AUDIO" ? transcript : null,
      synthesis: synthesis || null,
      relatedDocs: [],
      createdAt: new Date().toISOString(),
    }
    onAdd(newDecision)
    setTitle("")
    setContext("")
    setTranscript("")
    setSynthesis("")
    setRecordingPhase("idle")
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [stopRecording])

  return (
    <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-medium">Enregistrer une décision</h2>

      <div className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la décision"
          className="text-sm"
        />
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Contexte (optionnel)"
          rows={2}
          className="resize-none text-sm"
        />

        {/* Input mode selector */}
        <div className="flex gap-2">
          {(["TEXT", "AUDIO", "FILE"] as const).map((mode) => {
            const Icon = INPUT_TYPE_ICON[mode]
            return (
              <Button
                key={mode}
                variant={inputMode === mode ? "default" : "outline"}
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  setInputMode(mode)
                  setRecordingPhase("idle")
                  setTranscript("")
                  setSynthesis("")
                  stopRecording()
                }}
              >
                <Icon className="size-3.5" />
                {INPUT_TYPE_LABEL[mode]}
              </Button>
            )
          })}
        </div>

        {/* AUDIO mode */}
        {inputMode === "AUDIO" && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            {recordingPhase === "idle" && (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={startRecording}
                  className="flex size-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <Mic className="size-7" />
                </button>
                <p className="text-xs text-muted-foreground">Cliquez pour enregistrer</p>
              </div>
            )}

            {recordingPhase === "recording" && (
              <div className="flex flex-col items-center gap-3">
                <AudioWaveform isRecording={isRecording} />
                <div className="flex items-center gap-2">
                  <div className="size-2 animate-pulse rounded-full bg-destructive" />
                  <span className="text-sm font-medium text-destructive">Enregistrement...</span>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleStopManual}>
                  <Square className="size-3" />
                  Arrêter
                </Button>
              </div>
            )}

            {recordingPhase === "transcribing" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="size-5 text-primary" />
                  </motion.div>
                  <span className="text-sm font-medium">Transcription en cours...</span>
                </div>
              </div>
            )}

            {recordingPhase === "done" && transcript && (
              <div className="space-y-3">
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Volume2 className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Transcription
                    </span>
                  </div>
                  <p className="rounded-md bg-background p-3 text-sm leading-relaxed italic">
                    &ldquo;{transcript}&rdquo;
                  </p>
                </div>

                {!synthesis && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleSynthesize}
                    disabled={isSynthesizing}
                  >
                    <Sparkles
                      className={cn("size-3.5", isSynthesizing && "animate-spin")}
                    />
                    {isSynthesizing ? "Synthèse en cours..." : "Synthétiser"}
                  </Button>
                )}

                {synthesis && (
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">Synthèse IA</span>
                    </div>
                    <p className="rounded-md bg-primary/5 p-3 text-sm leading-relaxed">
                      {synthesis}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FILE mode */}
        {inputMode === "FILE" && (
          <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 p-8">
            <Upload className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Glissez un fichier ou cliquez pour parcourir
            </p>
            <Button variant="outline" size="sm" className="text-xs">
              Parcourir
            </Button>
          </div>
        )}

        <Button size="sm" onClick={handleSubmit} disabled={!title.trim()}>
          Enregistrer
        </Button>
      </div>
    </motion.div>
  )
}

// ── Timeline View ───────────────────────────────────────

function TimelineView({ decisions }: { decisions: DecisionData[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="relative ml-4 space-y-0 border-l-2 border-border pl-8">
      {decisions.map((d, index) => {
        const cfg = STATUS_CONFIG[d.status]
        const TypeIcon = INPUT_TYPE_ICON[d.inputType]
        const isExpanded = expandedId === d.id
        return (
          <motion.div key={d.id} variants={item} custom={index} className="relative pb-8 last:pb-0">
            {/* Dot on timeline */}
            <div
              className={cn(
                "absolute -left-[calc(2rem+5px)] top-1 size-3 rounded-full border-2 border-background",
                cfg.dotColor,
              )}
            />
            {/* Date */}
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {format(new Date(d.createdAt), "d MMMM yyyy", { locale: fr })}
            </p>
            {/* Card */}
            <div
              className="cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
              onClick={() => setExpandedId(isExpanded ? null : d.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold leading-snug">{d.title}</h4>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge className={cn("text-xs", cfg.badgeClass)} variant="outline">
                      {cfg.label}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TypeIcon className="size-3" />
                      <span className="text-xs">{INPUT_TYPE_LABEL[d.inputType]}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{d.author}</span>
                    {d.synthesis && (
                      <Badge
                        variant="secondary"
                        className="gap-1 text-[10px] text-primary"
                      >
                        <Sparkles className="size-2.5" />
                        Synthèse IA
                      </Badge>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedId(isExpanded ? null : d.id)
                  }}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
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
                        <p className="text-xs font-medium text-muted-foreground">Contexte</p>
                        <p className="mt-1 text-sm leading-relaxed">{d.context}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Justification</p>
                        <p className="mt-1 text-sm leading-relaxed">{d.justification}</p>
                      </div>

                      {/* Audio transcript */}
                      {d.inputType === "AUDIO" && d.transcript && (
                        <div>
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <Volume2 className="size-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Transcription audio
                            </span>
                          </div>
                          <p className="rounded-md bg-muted/50 p-3 text-sm italic leading-relaxed">
                            &ldquo;{d.transcript}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Synthesis */}
                      {d.synthesis && (
                        <div>
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <Sparkles className="size-3.5 text-primary" />
                            <span className="text-xs font-medium text-primary">Synthèse IA</span>
                          </div>
                          <p className="rounded-md bg-primary/5 p-3 text-sm leading-relaxed">
                            {d.synthesis}
                          </p>
                        </div>
                      )}

                      {d.relatedDocs.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Documents liés
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {d.relatedDocs.map((doc) => (
                              <Badge key={doc} variant="outline" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
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

// ── Table View ──────────────────────────────────────────

function TableView({
  decisions,
  sortField,
  sortDir,
  onSort,
}: {
  decisions: DecisionData[]
  sortField: "createdAt" | "status"
  sortDir: "asc" | "desc"
  onSort: (field: "createdAt" | "status") => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Décision</TableHead>
            <TableHead>Type</TableHead>
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {decisions.map((d) => {
            const cfg = STATUS_CONFIG[d.status]
            const TypeIcon = INPUT_TYPE_ICON[d.inputType]
            return (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TypeIcon className="size-3.5" />
                    <span className="text-xs">{INPUT_TYPE_LABEL[d.inputType]}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("text-xs", cfg.badgeClass)} variant="outline">
                    {cfg.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{d.author}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(d.createdAt), "d MMM yyyy", { locale: fr })}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

// ── Main component ──────────────────────────────────────

export function DecisionsClient({
  decisions: initialDecisions,
  projectName,
}: {
  decisions: DecisionData[]
  projectName: string
}) {
  const [decisions, setDecisions] = useState(initialDecisions)
  const [sortField, setSortField] = useState<"createdAt" | "status">("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  function handleSort(field: "createdAt" | "status") {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const handleAdd = (d: DecisionData) => {
    setDecisions((prev) => [d, ...prev])
  }

  const sortedDecisions = [...decisions].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1
    if (sortField === "createdAt") {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
    }
    return a.status.localeCompare(b.status) * dir
  })

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold tracking-tight">Journal des décisions</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {decisions.length} décision{decisions.length !== 1 ? "s" : ""} — {projectName}
        </p>
      </motion.div>

      {/* Record form */}
      <RecordDecisionForm onAdd={handleAdd} />

      {/* Views */}
      <motion.div variants={item}>
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="tableau">Tableau</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            {decisions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <Landmark className="size-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">Aucune décision enregistrée</p>
              </div>
            ) : (
              <TimelineView decisions={decisions} />
            )}
          </TabsContent>

          <TabsContent value="tableau" className="mt-6">
            {decisions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <Landmark className="size-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">Aucune décision enregistrée</p>
              </div>
            ) : (
              <TableView
                decisions={sortedDecisions}
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
              />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
