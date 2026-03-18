"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Lock,
  Unlock,
  Globe,
  X,
  MessageSquare,
  FileCode2,
  ChevronRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface ApiEndpointData {
  id: string
  method: HttpMethod
  route: string
  service: string
  description: string
  authRequired: boolean
  requestPayload: unknown
  responsePayload: unknown
  errors: unknown
  businessTags: string[]
  relatedComponents: string[]
  relatedDocuments: string[]
  businessRules: string[]
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-emerald-500/10 text-emerald-500",
  POST: "bg-blue-500/10 text-blue-500",
  PUT: "bg-amber-500/10 text-amber-500",
  PATCH: "bg-purple-500/10 text-purple-500",
  DELETE: "bg-red-500/10 text-red-500",
}

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"]

function JsonBlock({ label, data }: { label: string; data: unknown }) {
  if (!data) return null
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      <div className="bg-muted rounded-lg p-4 font-mono text-xs leading-relaxed">
        <pre className="overflow-x-auto break-all whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export function ApiExplorerClient({
  endpoints,
  projectName,
}: {
  endpoints: ApiEndpointData[]
  projectName: string
}) {
  const [search, setSearch] = useState("")
  const [selectedMethods, setSelectedMethods] = useState<Set<HttpMethod>>(new Set())
  const [authFilter, setAuthFilter] = useState<"all" | "auth" | "public">("all")
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointData | null>(null)

  const serviceGroups = useMemo(() => {
    const groups: Record<string, ApiEndpointData[]> = {}
    for (const ep of endpoints) {
      if (!groups[ep.service]) groups[ep.service] = []
      groups[ep.service].push(ep)
    }
    return groups
  }, [endpoints])

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      if (selectedService && ep.service !== selectedService) return false
      if (selectedMethods.size > 0 && !selectedMethods.has(ep.method)) return false
      if (authFilter === "auth" && !ep.authRequired) return false
      if (authFilter === "public" && ep.authRequired) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          ep.route.toLowerCase().includes(q) ||
          ep.description.toLowerCase().includes(q) ||
          ep.service.toLowerCase().includes(q) ||
          ep.businessTags.some((t) => t.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [endpoints, selectedService, selectedMethods, authFilter, search])

  function toggleMethod(method: HttpMethod) {
    setSelectedMethods((prev) => {
      const next = new Set(prev)
      if (next.has(method)) next.delete(method)
      else next.add(method)
      return next
    })
  }

  if (endpoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Globe className="text-muted-foreground size-12" />
        <p className="text-muted-foreground text-lg">Aucun endpoint documenté</p>
        <p className="text-muted-foreground text-sm">
          Les endpoints API apparaîtront ici une fois documentés.
        </p>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold tracking-tight">Explorateur d&apos;API</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {endpoints.length} endpoints documentés — {projectName}
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={item}
        className="border-border bg-card flex flex-wrap items-center gap-3 rounded-xl border p-4"
      >
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Rechercher un endpoint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => toggleMethod(m)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-xs font-semibold transition-all",
                selectedMethods.has(m)
                  ? METHOD_COLORS[m]
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-1.5">
          {(["all", "auth", "public"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setAuthFilter(f)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                authFilter === f
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "Tous" : f === "auth" ? "Authentifié" : "Public"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Three-column layout */}
      <motion.div variants={item} className="flex gap-6">
        {/* Left: Service groups */}
        <div className="w-[240px] shrink-0 space-y-1">
          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Services
          </p>
          <button
            onClick={() => setSelectedService(null)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
              selectedService === null
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <span>Tous les services</span>
            <span className="font-mono text-xs">{endpoints.length}</span>
          </button>
          {Object.entries(serviceGroups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([service, eps]) => (
              <button
                key={service}
                onClick={() => setSelectedService(selectedService === service ? null : service)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  selectedService === service
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span className="truncate">{service}</span>
                <span className="ml-2 font-mono text-xs">{eps.length}</span>
              </button>
            ))}
        </div>

        {/* Center: Endpoint list */}
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            {filteredEndpoints.length} endpoint{filteredEndpoints.length !== 1 ? "s" : ""}
          </p>
          <AnimatePresence mode="popLayout">
            {filteredEndpoints.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 py-12"
              >
                <Search className="text-muted-foreground size-8" />
                <p className="text-muted-foreground text-sm">
                  Aucun endpoint ne correspond aux filtres.
                </p>
              </motion.div>
            ) : (
              filteredEndpoints.map((ep) => (
                <motion.div
                  key={ep.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={cn(
                    "group border-border bg-card hover:border-primary/30 cursor-pointer rounded-xl border p-4 transition-all hover:shadow-sm",
                    selectedEndpoint?.id === ep.id && "border-primary/50 ring-primary/20 ring-1",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 inline-flex shrink-0 rounded-md px-2 py-0.5 font-mono text-xs font-bold",
                        METHOD_COLORS[ep.method],
                      )}
                    >
                      {ep.method}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <code className="truncate font-mono text-sm font-medium">{ep.route}</code>
                        {ep.authRequired ? (
                          <Lock className="size-3.5 shrink-0 text-amber-500" />
                        ) : (
                          <Unlock className="text-muted-foreground size-3.5 shrink-0" />
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                        {ep.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {ep.service}
                        </Badge>
                        {ep.businessTags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-muted-foreground text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {ep.businessTags.length > 3 && (
                          <span className="text-muted-foreground text-xs">
                            +{ep.businessTags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground mt-1 size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Right: Detail panel */}
        <div className="w-[320px] shrink-0">
          <AnimatePresence mode="wait">
            {selectedEndpoint ? (
              <motion.div
                key={selectedEndpoint.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="border-border bg-card sticky top-6 space-y-5 rounded-xl border p-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2">
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2.5 py-1 font-mono text-sm font-bold",
                        METHOD_COLORS[selectedEndpoint.method],
                      )}
                    >
                      {selectedEndpoint.method}
                    </span>
                    <code className="block font-mono text-sm font-semibold break-all">
                      {selectedEndpoint.route}
                    </code>
                  </div>
                  <button
                    onClick={() => setSelectedEndpoint(null)}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md p-1 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selectedEndpoint.description}
                </p>

                {/* Auth status */}
                <div className="flex items-center gap-2 text-sm">
                  {selectedEndpoint.authRequired ? (
                    <>
                      <Lock className="size-3.5 text-amber-500" />
                      <span className="text-amber-500">Authentification requise</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="text-muted-foreground size-3.5" />
                      <span className="text-muted-foreground">Endpoint public</span>
                    </>
                  )}
                </div>

                <Separator />

                {/* JSON blocks */}
                <JsonBlock label="Payload d'entrée" data={selectedEndpoint.requestPayload} />
                <JsonBlock label="Réponse" data={selectedEndpoint.responsePayload} />
                <JsonBlock label="Erreurs possibles" data={selectedEndpoint.errors} />

                {/* Business rules */}
                {selectedEndpoint.businessRules.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm font-medium">Règles métier</p>
                    <ul className="space-y-1.5">
                      {selectedEndpoint.businessRules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm leading-snug">
                          <span className="bg-primary mt-1.5 inline-block size-1.5 shrink-0 rounded-full" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Related components */}
                {selectedEndpoint.relatedComponents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm font-medium">
                      Composants front liés
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEndpoint.relatedComponents.map((comp) => (
                        <Badge key={comp} variant="secondary" className="text-xs">
                          <FileCode2 className="mr-1 size-3" />
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related documents */}
                {selectedEndpoint.relatedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm font-medium">Documents liés</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEndpoint.relatedDocuments.map((doc) => (
                        <Badge key={doc} variant="outline" className="text-xs">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <Button className="w-full gap-2" variant="outline">
                  <MessageSquare className="size-4" />
                  Interroger l&apos;assistant sur cette API
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-border flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center"
              >
                <Globe className="text-muted-foreground size-8" />
                <p className="text-muted-foreground text-sm">
                  Sélectionnez un endpoint pour voir ses détails
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
