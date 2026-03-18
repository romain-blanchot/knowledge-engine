import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { ApiExplorerClient } from "@/components/features/api-explorer/api-explorer-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Explorateur d'API — Frogia",
  description: "Explorez et documentez les endpoints API du projet",
}

export default async function ApiExplorerPage() {
  try {
    const project = await prisma.project.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { lastActivity: "desc" },
    })

    if (!project) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-muted-foreground text-lg">Aucun projet actif</p>
          <p className="text-muted-foreground text-sm">
            Créez un nouveau projet pour accéder à l&apos;explorateur d&apos;API.
          </p>
        </div>
      )
    }

    const endpoints = await prisma.apiEndpoint.findMany({
      where: { projectId: project.id },
      orderBy: [{ service: "asc" }, { route: "asc" }],
    })

    const serializedEndpoints = endpoints.map(
      (ep: {
        id: string
        method: string
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
      }) => ({
        id: ep.id,
        method: ep.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        route: ep.route,
        service: ep.service,
        description: ep.description,
        authRequired: ep.authRequired,
        requestPayload: ep.requestPayload,
        responsePayload: ep.responsePayload,
        errors: ep.errors,
        businessTags: ep.businessTags,
        relatedComponents: ep.relatedComponents,
        relatedDocuments: ep.relatedDocuments,
        businessRules: ep.businessRules,
      }),
    )

    return <ApiExplorerClient endpoints={serializedEndpoints} projectName={project.name} />
  } catch (error) {
    console.error("Failed to load API explorer data:", error)
    return <ApiExplorerClient endpoints={[]} projectName="" />
  }
}
