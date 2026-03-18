"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Settings2,
  BookOpen,
  Brain,
  Users,
  Cloud,
  MessageSquare,
  Code2,
  CheckCircle2,
  Loader2,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

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

type IntegrationStatus = "CONNECTED" | "PENDING" | "AVAILABLE" | "DISABLED"

interface Integration {
  name: string
  icon: React.ComponentType<{ className?: string }>
  status: IntegrationStatus
  lastSync?: string
}

interface MockUser {
  name: string
  role: string
  email: string
  status: "Actif" | "Invité"
}

const INTEGRATIONS: Integration[] = [
  { name: "Notion", icon: BookOpen, status: "CONNECTED", lastSync: "il y a 2 heures" },
  { name: "Google Drive", icon: Cloud, status: "CONNECTED", lastSync: "il y a 5 heures" },
  { name: "Confluence", icon: BookOpen, status: "PENDING" },
  { name: "Slack", icon: MessageSquare, status: "AVAILABLE" },
  { name: "GitHub", icon: Code2, status: "AVAILABLE" },
  { name: "Jira", icon: Zap, status: "DISABLED" },
]

const INTEGRATION_STATUS_CONFIG: Record<IntegrationStatus, { label: string; className: string }> = {
  CONNECTED: { label: "Connecté", className: "bg-emerald-500/10 text-emerald-500" },
  PENDING: { label: "En cours", className: "bg-amber-500/10 text-amber-500" },
  AVAILABLE: { label: "Disponible", className: "bg-blue-500/10 text-blue-500" },
  DISABLED: { label: "Désactivé", className: "bg-muted text-muted-foreground" },
}

const MOCK_USERS: MockUser[] = [
  { name: "Romain L.", role: "Admin", email: "romain@frogworks.fr", status: "Actif" },
  { name: "Marie D.", role: "Consultant", email: "marie@frogworks.fr", status: "Actif" },
  { name: "Thomas B.", role: "Analyste", email: "thomas@frogworks.fr", status: "Actif" },
  { name: "Sophie M.", role: "Viewer", email: "sophie@frogworks.fr", status: "Invité" },
]

const ROLE_STYLES: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  Consultant: "bg-blue-500/10 text-blue-500",
  Analyste: "bg-amber-500/10 text-amber-500",
  Viewer: "bg-muted text-muted-foreground",
}

function WorkspaceTab() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
        <h3 className="mb-4 text-lg font-medium">Informations de l&apos;espace de travail</h3>
        <div className="max-w-lg space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom de l&apos;espace</label>
            <Input defaultValue="FrogWorks — Connaissance Produit" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              defaultValue="Espace centralisé de connaissance pour les projets B2B SaaS de FrogWorks. Gestion des spécifications, APIs et décisions d'architecture."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Industrie</label>
            <Select defaultValue="saas">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saas">SaaS / Logiciel</SelectItem>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="healthtech">Healthtech</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <Button disabled>Enregistrer les modifications</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SourcesTab() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item}>
        <p className="text-muted-foreground text-sm">
          Connectez vos sources de données pour alimenter la base de connaissance.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((integration, index) => {
          const Icon = integration.icon
          const cfg = INTEGRATION_STATUS_CONFIG[integration.status]
          const isConnected = integration.status === "CONNECTED"
          return (
            <motion.div
              key={integration.name}
              variants={item}
              custom={index}
              className="border-border bg-card hover:border-primary/20 rounded-xl border p-5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-lg p-2.5">
                    <Icon className="text-foreground size-5" />
                  </div>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <Badge className={cn("mt-1 text-[10px]", cfg.className)} variant="outline">
                      {cfg.label}
                    </Badge>
                  </div>
                </div>
                <Switch checked={isConnected} disabled />
              </div>
              {integration.lastSync && (
                <p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  Dernière synchronisation {integration.lastSync}
                </p>
              )}
              {integration.status === "PENDING" && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-500">
                  <Loader2 className="size-3 animate-spin" />
                  Configuration en cours...
                </p>
              )}
              <Button variant="outline" size="sm" className="mt-4 w-full" disabled>
                Configurer
              </Button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

function AIPreferencesTab() {
  const [detailLevel, setDetailLevel] = useState<"concis" | "standard" | "detaille">("standard")

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="border-border bg-card rounded-xl border p-6">
        <h3 className="mb-4 text-lg font-medium">Préférences de l&apos;assistant IA</h3>
        <div className="max-w-lg space-y-6">
          {/* Model selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Modèle de langage</label>
            <Select defaultValue="pro">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pro">Frogia Pro</SelectItem>
                <SelectItem value="standard">Frogia Standard</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Le modèle Pro offre des analyses plus détaillées et précises.
            </p>
          </div>

          <Separator />

          {/* Detail level */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Niveau de détail des réponses</label>
            <div className="flex gap-2">
              {(
                [
                  { value: "concis" as const, label: "Concis" },
                  { value: "standard" as const, label: "Standard" },
                  { value: "detaille" as const, label: "Détaillé" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDetailLevel(option.value)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                    detailLevel === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Language */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Langue de l&apos;assistant</label>
            <Select defaultValue="fr">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Indexation RAG automatique</p>
                <p className="text-muted-foreground text-xs">
                  Indexer automatiquement les nouveaux documents ajoutés
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Routage contextuel Ring</p>
                <p className="text-muted-foreground text-xs">
                  Activer le routage intelligent des requêtes par contexte
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function UsersTab() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item}>
        <p className="text-muted-foreground text-sm">
          Gérez les utilisateurs et leurs rôles dans l&apos;espace de travail.
        </p>
      </motion.div>
      <motion.div variants={item} className="border-border bg-card rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_USERS.map((user) => (
              <TableRow key={user.email}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "text-xs",
                      ROLE_STYLES[user.role] ?? "bg-muted text-muted-foreground",
                    )}
                    variant="outline"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {user.email}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "size-2 rounded-full",
                        user.status === "Actif" ? "bg-emerald-500" : "bg-amber-500",
                      )}
                    />
                    <span className="text-muted-foreground text-sm">{user.status}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  )
}

export default function SettingsPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configurez votre espace de travail, vos intégrations et vos préférences.
        </p>
      </motion.div>

      {/* Settings tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="workspace">
          <TabsList>
            <TabsTrigger value="workspace" className="gap-1.5">
              <Settings2 className="size-4" />
              Espace de travail
            </TabsTrigger>
            <TabsTrigger value="sources" className="gap-1.5">
              <Cloud className="size-4" />
              Sources de connaissance
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5">
              <Brain className="size-4" />
              Préférences IA
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="size-4" />
              Accès utilisateurs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workspace" className="mt-6">
            <WorkspaceTab />
          </TabsContent>

          <TabsContent value="sources" className="mt-6">
            <SourcesTab />
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <AIPreferencesTab />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UsersTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
