import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { ImpactClient } from "@/components/features/impact/impact-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Analyses d'impact — Frogia",
  description: "Liste des analyses d'impact générées pour le projet",
}

export default async function ImpactListPage() {
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
            Créez un nouveau projet pour accéder aux analyses d&apos;impact.
          </p>
        </div>
      )
    }

    const analyses = await prisma.impactAnalysis.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
    })

    const serializedAnalyses = analyses.map(
      (a: {
        id: string
        title: string
        feature: string
        complexityScore: number
        confidenceScore: number
        sourceDocs: string[]
        impactedEndpoints: string[]
        impactedComponents: string[]
        createdAt: Date
      }) => ({
        id: a.id,
        title: a.title,
        feature: a.feature,
        complexityScore: a.complexityScore,
        confidenceScore: a.confidenceScore,
        sourceDocs: a.sourceDocs,
        impactedEndpoints: a.impactedEndpoints,
        impactedComponents: a.impactedComponents,
        createdAt: a.createdAt.toISOString(),
      }),
    )

    return <ImpactClient analyses={serializedAnalyses} projectName={project.name} />
  } catch (error) {
    console.error("Failed to load impact analyses:", error)
    return <ImpactClient analyses={[]} projectName="" />
  }
}
