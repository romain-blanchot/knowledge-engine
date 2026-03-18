"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale/fr"
import {
  Search,
  Cog,
  Monitor,
  FileText,
  Globe,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Send,
  Plus,
  PanelRight,
  PanelRightClose,
  MessageSquare,
  Sparkles,
  Database,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useStreamingSimulation, type StreamingSection } from "@/hooks/use-streaming-simulation"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SerializedMessage {
  id: string
  role: "USER" | "ASSISTANT"
  content: string
  summary: string | null
  operationalImpacts: string[]
  clientImpacts: string[]
  documentsUsed: string[]
  processesUsed: string[]
  openQuestions: string[]
  risks: string[]
  suggestedActions: string[]
  confidenceScore: number | null
  conversationId: string
  createdAt: string
}

interface SerializedConversation {
  id: string
  title: string
  projectId: string
  createdAt: string
  updatedAt: string
  messages: SerializedMessage[]
}

interface ChatClientProps {
  conversations: SerializedConversation[]
  projectName?: string
}

// ---------------------------------------------------------------------------
// Mock Responses
// ---------------------------------------------------------------------------

const MOCK_RESPONSES: Omit<SerializedMessage, "id" | "conversationId" | "createdAt">[] = [
  {
    role: "ASSISTANT",
    content: "Analyse des impacts de la carte cadeau entreprise sur l'architecture existante.",
    summary:
      "La fonctionnalite carte cadeau entreprise necessite des modifications significatives sur 3 services backend, 2 modules frontend et impacte directement les flux de paiement existants. Le CDC mentionne une integration avec le systeme de fidelite qui n'est pas documentee dans le SFD.",
    operationalImpacts: [
      "Service Paiement : ajout d'un nouveau type de transaction GIFT_CARD avec gestion du solde partiel",
      "Service Commande : prise en charge du split de paiement carte cadeau + CB",
      "Service Notification : nouveaux templates email pour l'envoi et l'activation de la carte",
      "Base de donnees : nouvelle table gift_cards avec relations vers users et transactions",
    ],
    clientImpacts: [
      "Module Checkout : integration du champ de saisie code carte cadeau avec validation temps reel",
      "Espace Client : page de gestion des cartes cadeaux (solde, historique, transfert)",
      "Back-office : interface d'emission et de suivi des cartes cadeaux entreprise",
    ],
    documentsUsed: [
      "CDC-2024-CarteCadeau-v3.pdf",
      "SFD-Paiements-v2.1.docx",
      "Architecture-Microservices.md",
    ],
    processesUsed: [
      "POST /api/v2/gift-cards/create",
      "GET /api/v2/gift-cards/{id}/balance",
      "POST /api/v2/payments/process",
    ],
    openQuestions: [
      "Le CDC prevoit un transfert de solde entre cartes cadeaux, mais le SFD ne mentionne pas cette fonctionnalite. Faut-il l'implementer dans la V1 ?",
      "Quelle est la duree de validite des cartes cadeaux entreprise ? Non specifie dans les documents.",
    ],
    risks: [
      "Risque de regression sur le flux de paiement existant lors de l'ajout du split payment",
      "L'absence de documentation sur l'integration fidelite peut generer des retards",
    ],
    suggestedActions: [
      "Valider avec le PO la priorite du transfert de solde",
      "Documenter l'API gift-cards dans le SFD avant developpement",
      "Planifier une session d'architecture pour le split payment",
      "Ajouter des tests E2E sur le flux de paiement avant modification",
    ],
    confidenceScore: 87,
  },
  {
    role: "ASSISTANT",
    content: "Analyse de coherence entre le CDC et le SFD sur le module de paiement.",
    summary:
      "L'analyse croisee revele 4 divergences entre le Cahier des Charges et les Specifications Fonctionnelles Detaillees sur le module de paiement. Deux divergences sont critiques et necessitent une clarification avant le demarrage du developpement.",
    operationalImpacts: [
      "Le SFD prevoit un webhook Stripe pour la confirmation, le CDC mentionne un polling — impact sur l'architecture asynchrone",
      "Divergence sur le retry policy : CDC = 3 tentatives, SFD = 5 tentatives avec backoff exponentiel",
      "Le SFD inclut un service de reconciliation absent du CDC",
    ],
    clientImpacts: [
      "Le CDC prevoit une page de confirmation synchrone, le SFD une page avec polling de statut",
      "Gestion du timeout cote client : 30s dans le CDC vs 60s dans le SFD",
    ],
    documentsUsed: [
      "CDC-Paiements-v4.pdf",
      "SFD-Paiements-v2.1.docx",
      "SFD-Webhooks-v1.pdf",
      "Matrice-Exigences-Paiement.xlsx",
    ],
    processesUsed: [
      "POST /api/v2/payments/process",
      "GET /api/v2/payments/{id}/status",
      "POST /api/v2/webhooks/stripe",
    ],
    openQuestions: [
      "Webhook ou polling pour la confirmation de paiement ? Les deux documents se contredisent.",
      "Le service de reconciliation du SFD est-il un prerequis pour la V1 ou une evolution V2 ?",
      "Quel retry policy appliquer ? Le CDC et le SFD ne concordent pas.",
    ],
    risks: [
      "Le demarrage du developpement sans clarification pourrait entrainer un refactoring couteux",
      "Impact potentiel sur le planning si la reconciliation est requise en V1",
      "Risque de non-conformite si le retry policy n'est pas aligne",
    ],
    suggestedActions: [
      "Organiser une reunion de clarification CDC/SFD avec les parties prenantes",
      "Creer une matrice de decision pour les divergences identifiees",
      "Prioriser la resolution des 2 divergences critiques",
    ],
    confidenceScore: 92,
  },
  {
    role: "ASSISTANT",
    content: "Inventaire des APIs necessaires pour le module de reservation entreprise.",
    summary:
      "Le module de reservation entreprise necessite 12 endpoints repartis sur 4 services. 7 endpoints existent deja et 5 doivent etre crees. L'integration avec le service de disponibilite en temps reel est le point d'attention principal.",
    operationalImpacts: [
      "Service Reservation : 3 nouveaux endpoints (create, update, cancel) avec gestion des quotas entreprise",
      "Service Disponibilite : adaptation de l'endpoint existant pour supporter les creneaux bloques entreprise",
      "Service Facturation : nouveau endpoint pour la facturation groupee mensuelle",
      "Service Auth : extension du middleware pour les tokens entreprise avec scopes specifiques",
    ],
    clientImpacts: [
      "Portail Entreprise : interface complete de reservation avec calendrier et gestion des collaborateurs",
      "Dashboard Admin : vue consolidee des reservations entreprise avec export CSV",
    ],
    documentsUsed: [
      "CDC-ReservationEntreprise-v2.pdf",
      "API-Catalogue-v3.yaml",
      "Architecture-Auth-v1.md",
    ],
    processesUsed: [
      "POST /api/v2/bookings/enterprise/create",
      "GET /api/v2/availability/slots",
      "PUT /api/v2/bookings/{id}",
      "POST /api/v2/billing/enterprise/invoice",
      "GET /api/v2/enterprise/{id}/quota",
    ],
    openQuestions: [
      "La facturation groupee doit-elle inclure un mecanisme d'avoir automatique en cas d'annulation ?",
      "Quel est le delai minimum d'annulation sans frais pour les reservations entreprise ?",
    ],
    risks: [
      "La disponibilite temps reel peut generer une charge importante sur le service existant",
      "L'absence de rate limiting sur les endpoints entreprise pourrait impacter les performances",
    ],
    suggestedActions: [
      "Specifier les endpoints manquants dans le SFD",
      "Realiser un test de charge sur le service de disponibilite",
      "Definir les quotas par defaut pour les comptes entreprise",
    ],
    confidenceScore: 79,
  },
  {
    role: "ASSISTANT",
    content: "Points a clarifier avant le demarrage du developpement du sprint 4.",
    summary:
      "L'analyse pre-sprint identifie 8 points de clarification repartis en 3 categories : fonctionnels (4), techniques (2) et organisationnels (2). Trois points sont bloquants pour le demarrage.",
    operationalImpacts: [
      "Strategie de migration de la base de donnees non definie pour les nouvelles tables",
      "Choix du broker de messages pour la communication inter-services en attente",
    ],
    clientImpacts: [
      "Design system non finalise pour les composants de reservation",
      "Strategie de cache client non definie pour les donnees de disponibilite",
    ],
    documentsUsed: [
      "Sprint4-Backlog.md",
      "CDC-ReservationEntreprise-v2.pdf",
      "SFD-Paiements-v2.1.docx",
      "ADR-003-MessageBroker.md",
    ],
    processesUsed: ["GET /api/v2/availability/slots", "POST /api/v2/bookings/enterprise/create"],
    openQuestions: [
      "Le PO doit valider le perimetre exact du MVP reservation entreprise",
      "L'equipe infra doit confirmer la disponibilite de l'environnement de staging",
      "Decision en attente sur RabbitMQ vs Kafka pour le message broker",
      "Validation du budget pour les licences des outils de monitoring",
    ],
    risks: [
      "Retard de 1 a 2 sprints si les points bloquants ne sont pas resolus avant le planning",
      "Risque de dette technique si les choix d'architecture sont differes",
      "Impact sur le moral de l'equipe si le sprint demarre avec trop d'incertitudes",
    ],
    suggestedActions: [
      "Bloquer un creneau de 2h avec le PO pour les arbitrages fonctionnels",
      "Finaliser l'ADR sur le message broker avant le sprint planning",
      "Demander une confirmation ecrite de l'equipe infra sur le staging",
      "Preparer un plan B en cas de retard sur l'environnement",
    ],
    confidenceScore: 84,
  },
]

const QUICK_PROMPTS = [
  "Quels sont les impacts de la carte cadeau entreprise ?",
  "Le CDC et le SFD sont-ils coherents sur les paiements ?",
  "Quelles APIs pour la reservation entreprise ?",
  "Points a clarifier avant developpement ?",
  "Analyse les risques du module fidelite",
  "Resume les decisions d'architecture en attente",
]

const CONTEXT_DOCUMENTS = [
  { name: "CDC-Paiements-v4.pdf", status: "INDEXED" },
  { name: "SFD-Paiements-v2.1.docx", status: "INDEXED" },
  { name: "Architecture-Microservices.md", status: "INDEXED" },
  { name: "Sprint4-Backlog.md", status: "PENDING" },
]

const CONTEXT_ENDPOINTS = [
  { method: "GET", route: "/api/v2/payments/{id}/status" },
  { method: "POST", route: "/api/v2/payments/process" },
  { method: "POST", route: "/api/v2/webhooks/stripe" },
]

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PATCH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="bg-primary/60 size-2 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1, 0.85] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut" as const,
          }}
        />
      ))}
    </div>
  )
}

function StreamingSkeleton() {
  return (
    <div className="space-y-3 p-5">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <div className="flex items-center gap-2 pt-1 pb-2">
      <Icon className="text-muted-foreground size-3.5" />
      <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        {label}
      </span>
    </div>
  )
}

function SectionList({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
          <span className="bg-muted-foreground/50 mt-2 block size-1 flex-shrink-0 rounded-full" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function ConfidenceBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-xs font-medium">Confiance</span>
      <div className="bg-muted h-1.5 w-24 overflow-hidden rounded-full">
        <motion.div
          className="bg-primary h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
        />
      </div>
      <span className="font-mono text-xs font-semibold">{score}%</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Assistant Message
// ---------------------------------------------------------------------------

function AssistantMessage({
  message,
  isLatest,
  onQuickAction,
}: {
  message: SerializedMessage
  isLatest: boolean
  onQuickAction?: (action: string) => void
}) {
  const { visibleSections, isStreaming, isSkeleton } = useStreamingSimulation({
    enabled: isLatest,
  })

  const show = (section: StreamingSection) => visibleSections.has(section)

  const sectionMotion = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut" as const },
  }

  if (isSkeleton) {
    return (
      <div className="max-w-full">
        <div className="border-border bg-card rounded-xl border">
          <StreamingSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full">
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="divide-border/50 space-y-0 divide-y">
          {/* Summary */}
          {show("summary") && (
            <motion.div className="p-5" {...sectionMotion}>
              <SectionHeader icon={Search} label="Resume" />
              <p className="text-sm leading-relaxed">{message.summary}</p>
            </motion.div>
          )}

          {/* Operational Impacts */}
          {show("operationalImpacts") && message.operationalImpacts.length > 0 && (
            <motion.div className="p-5" {...sectionMotion}>
              <SectionHeader icon={Cog} label="Implications operationnelles" />
              <SectionList items={message.operationalImpacts} />
            </motion.div>
          )}

          {/* Client Impacts */}
          {show("clientImpacts") && message.clientImpacts.length > 0 && (
            <motion.div className="p-5" {...sectionMotion}>
              <SectionHeader icon={Monitor} label="Impacts experience client" />
              <SectionList items={message.clientImpacts} />
            </motion.div>
          )}

          {/* Documents & APIs */}
          {show("documents") && (
            <motion.div className="p-5" {...sectionMotion}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {message.documentsUsed.length > 0 && (
                  <div>
                    <SectionHeader icon={FileText} label="Documents consultes" />
                    <ul className="space-y-1.5">
                      {message.documentsUsed.map((doc, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <FileText className="text-muted-foreground/60 size-3 flex-shrink-0" />
                          <span className="font-mono text-xs">{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {message.processesUsed.length > 0 && (
                  <div>
                    <SectionHeader icon={Globe} label="Processus concernes" />
                    <ul className="space-y-1.5">
                      {message.processesUsed.map((process, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Globe className="text-muted-foreground/60 size-3 flex-shrink-0" />
                          <span className="font-mono text-xs">{process}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Open Questions */}
          {show("questions") && message.openQuestions.length > 0 && (
            <motion.div className="p-5" {...sectionMotion}>
              <SectionHeader icon={HelpCircle} label="Questions ouvertes" />
              <SectionList items={message.openQuestions} />
            </motion.div>
          )}

          {/* Risks */}
          {show("risks") && message.risks.length > 0 && (
            <motion.div className="p-5" {...sectionMotion}>
              <SectionHeader icon={AlertTriangle} label="Risques" />
              <SectionList items={message.risks} />
            </motion.div>
          )}

          {/* Actions + Confidence */}
          {show("actions") && (
            <motion.div className="space-y-4 p-5" {...sectionMotion}>
              {message.suggestedActions.length > 0 && (
                <div>
                  <SectionHeader icon={Lightbulb} label="Actions suggerees" />
                  <SectionList items={message.suggestedActions} />
                </div>
              )}

              {message.confidenceScore !== null && (
                <div className="pt-2">
                  <ConfidenceBar score={message.confidenceScore} />
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onQuickAction?.("apis")}
                >
                  <Globe className="size-3" />
                  Voir APIs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onQuickAction?.("sources")}
                >
                  <FileText className="size-3" />
                  Sources
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onQuickAction?.("analyser")}
                >
                  <Search className="size-3" />
                  Analyser
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onQuickAction?.("sauvegarder")}
                >
                  <Sparkles className="size-3" />
                  Sauvegarder
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="border-border/50 border-t px-5 py-2">
            <div className="flex items-center gap-2">
              <motion.div
                className="bg-primary size-1.5 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-muted-foreground text-xs">Analyse en cours...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// User Message
// ---------------------------------------------------------------------------

function UserMessage({ message }: { message: SerializedMessage }) {
  return (
    <div className="flex justify-end">
      <div className="bg-primary/10 max-w-[80%] rounded-2xl rounded-br-md px-4 py-3">
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Conversation List Item
// ---------------------------------------------------------------------------

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: SerializedConversation
  isActive: boolean
  onClick: () => void
}) {
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  const preview = lastMessage
    ? lastMessage.content.slice(0, 60) + (lastMessage.content.length > 60 ? "..." : "")
    : "Aucun message"

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg px-3 py-3 text-left transition-colors",
        isActive ? "bg-primary/10" : "hover:bg-accent/50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium">{conversation.title}</p>
      </div>
      <p className="text-muted-foreground mt-1 truncate text-xs">{preview}</p>
      <p className="text-muted-foreground/70 mt-1 font-mono text-xs">
        {formatDistanceToNow(new Date(conversation.updatedAt), {
          locale: fr,
          addSuffix: true,
        })}
      </p>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Context Panel
// ---------------------------------------------------------------------------

function ContextPanel({ message }: { message?: SerializedMessage }) {
  const confidence = message?.confidenceScore ?? 87
  const mainSource = message?.documentsUsed?.[0] ?? "CDC-Paiements-v4.pdf"

  return (
    <div className="flex h-full flex-col">
      <div className="border-border border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Contexte utilise</h3>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Documents */}
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Documents injectes
          </p>
          <div className="space-y-2">
            {CONTEXT_DOCUMENTS.map((doc) => (
              <div key={doc.name} className="flex items-center gap-2">
                <FileText className="text-muted-foreground/60 size-3.5 flex-shrink-0" />
                <span className="flex-1 truncate font-mono text-xs">{doc.name}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-1.5 py-0 text-[10px]",
                    doc.status === "INDEXED"
                      ? "border-emerald-500/30 text-emerald-400"
                      : "border-amber-500/30 text-amber-400",
                  )}
                >
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Endpoints */}
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Endpoints lies
          </p>
          <div className="space-y-2">
            {CONTEXT_ENDPOINTS.map((ep) => (
              <div key={ep.route} className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("px-1.5 py-0 font-mono text-[10px]", METHOD_COLORS[ep.method])}
                >
                  {ep.method}
                </Badge>
                <span className="text-muted-foreground truncate font-mono text-xs">{ep.route}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Confidence */}
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Niveau de confiance
          </p>
          <div className="flex items-center gap-3">
            <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className="font-mono text-sm font-semibold">{confidence}%</span>
          </div>
        </div>

        <Separator />

        {/* Source principale */}
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Source principale
          </p>
          <div className="flex items-center gap-2">
            <FileText className="text-primary size-3.5" />
            <span className="font-mono text-xs">{mainSource}</span>
          </div>
        </div>

        <Separator />

        {/* Statuses */}
        <div className="space-y-3">
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wider uppercase">
              Statut Ring
            </p>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-400" />
              <span className="text-xs">Contexte actif</span>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wider uppercase">
              Statut RAG
            </p>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-400" />
              <span className="text-xs">38 sources indexees</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main ChatClient
// ---------------------------------------------------------------------------

export function ChatClient({ conversations: initialConversations, projectName }: ChatClientProps) {
  const [conversations, setConversations] = useState<SerializedConversation[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversations[0]?.id ?? null,
  )
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [contextOpen, setContextOpen] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mockResponseIndex = useRef(0)

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null
  const messages = activeConversation?.messages ?? []

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, isTyping, scrollToBottom])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = "auto"
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
    }
  }, [inputValue])

  const simulateResponse = useCallback((userContent: string, conversationId: string) => {
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)

      const mockData = MOCK_RESPONSES[mockResponseIndex.current % MOCK_RESPONSES.length]
      mockResponseIndex.current += 1

      const newMessageId = `msg-${Date.now()}-assistant`
      const assistantMessage: SerializedMessage = {
        id: newMessageId,
        role: "ASSISTANT",
        content: mockData.content,
        summary: mockData.summary,
        operationalImpacts: mockData.operationalImpacts,
        clientImpacts: mockData.clientImpacts,
        documentsUsed: mockData.documentsUsed,
        processesUsed: mockData.processesUsed,
        openQuestions: mockData.openQuestions,
        risks: mockData.risks,
        suggestedActions: mockData.suggestedActions,
        confidenceScore: mockData.confidenceScore,
        conversationId,
        createdAt: new Date().toISOString(),
      }

      setStreamingMessageId(newMessageId)
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [...c.messages, assistantMessage],
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      )

      // Clear streaming flag after animation completes
      setTimeout(
        () => {
          setStreamingMessageId(null)
        },
        800 + 7 * 500 + 500,
      )
    }, 1500)
  }, [])

  const handleSend = useCallback(
    (content?: string) => {
      const text = (content ?? inputValue).trim()
      if (!text || isTyping) return

      let conversationId = activeConversationId

      // If no active conversation, create one
      if (!conversationId) {
        const newConv: SerializedConversation = {
          id: `conv-${Date.now()}`,
          title: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
          projectId: "local",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        }
        setConversations((prev) => [newConv, ...prev])
        setActiveConversationId(newConv.id)
        conversationId = newConv.id
      }

      const userMessage: SerializedMessage = {
        id: `msg-${Date.now()}-user`,
        role: "USER",
        content: text,
        summary: null,
        operationalImpacts: [],
        clientImpacts: [],
        documentsUsed: [],
        processesUsed: [],
        openQuestions: [],
        risks: [],
        suggestedActions: [],
        confidenceScore: null,
        conversationId,
        createdAt: new Date().toISOString(),
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, userMessage], updatedAt: new Date().toISOString() }
            : c,
        ),
      )

      setInputValue("")
      simulateResponse(text, conversationId)
    },
    [inputValue, isTyping, activeConversationId, simulateResponse],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewConversation = () => {
    const newConv: SerializedConversation = {
      id: `conv-${Date.now()}`,
      title: "Nouvelle conversation",
      projectId: "local",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    }
    setConversations((prev) => [newConv, ...prev])
    setActiveConversationId(newConv.id)
  }

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "ASSISTANT")

  return (
    <div className="-m-6 flex h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] gap-0 lg:-m-8">
      {/* ----------------------------------------------------------------- */}
      {/* Left Panel — Conversation List                                     */}
      {/* ----------------------------------------------------------------- */}
      <div className="border-border hidden w-[280px] flex-shrink-0 flex-col border-r md:flex">
        <div className="border-border border-b p-3">
          <Button
            onClick={handleNewConversation}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <Plus className="size-4" />
            Nouvelle conversation
          </Button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <MessageSquare className="text-muted-foreground/40 size-8" />
              <p className="text-muted-foreground text-xs">Aucune conversation</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                onClick={() => setActiveConversationId(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Center — Chat Area                                                 */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Chat header */}
        <div className="border-border flex items-center justify-between border-b px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <Sparkles className="text-primary size-4 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">
                {activeConversation?.title ?? "Frogia Assistant"}
              </h2>
              {projectName && (
                <p className="text-muted-foreground truncate text-xs">{projectName}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setContextOpen(!contextOpen)}
            className="flex-shrink-0"
          >
            {contextOpen ? (
              <PanelRightClose className="size-4" />
            ) : (
              <PanelRight className="size-4" />
            )}
          </Button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6">
            {/* Quick prompts — shown when no messages */}
            {messages.length === 0 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="mb-8 text-center">
                  <div className="bg-primary/10 mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl">
                    <Sparkles className="text-primary size-6" />
                  </div>
                  <h3 className="text-lg font-semibold">Comment puis-je vous aider ?</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Posez une question sur votre projet, vos documents ou vos APIs.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="border-border/50 hover:bg-accent rounded-lg border px-3 py-2.5 text-left text-sm transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" as const }}
                    layout
                  >
                    {message.role === "USER" ? (
                      <UserMessage message={message} />
                    ) : (
                      <AssistantMessage
                        message={message}
                        isLatest={message.id === streamingMessageId}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-full"
                >
                  <div className="border-border bg-card inline-block rounded-xl border">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="border-border bg-background/80 border-t backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="border-border bg-card flex items-end gap-2 rounded-xl border p-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                rows={1}
                disabled={isTyping}
                className="placeholder:text-muted-foreground max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none disabled:opacity-50"
              />
              <Button
                size="icon"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="size-8 flex-shrink-0 rounded-lg"
              >
                <Send className="size-4" />
              </Button>
            </div>
            <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
              <Database className="size-3" />
              <span>
                Frogia analyse <span className="text-foreground/70 font-mono font-medium">42</span>{" "}
                documents et <span className="text-foreground/70 font-mono font-medium">18</span>{" "}
                APIs pour ce projet
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Right Panel — Context (toggleable)                                 */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {contextOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" as const }}
            className="border-border hidden flex-shrink-0 overflow-hidden border-l lg:block"
          >
            <div className="w-[320px]">
              <ContextPanel message={lastAssistantMessage} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
