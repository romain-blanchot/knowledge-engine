import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { ExplorationClient } from "@/components/features/exploration/exploration-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Pistes d'exploration — Frogia",
  description: "Questions d'exploration organisées par catégorie",
}

export default async function ExplorationPage() {
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
            Créez un projet pour accéder aux pistes d&apos;exploration.
          </p>
        </div>
      )
    }

    const paths = await prisma.explorationPath.findMany({
      where: { projectId: project.id },
      include: {
        questions: {
          orderBy: { priority: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    const serializedPaths = paths.map((p) => ({
      id: p.id,
      category: p.category as
        | "CONTEXTE_ENTREPRISE"
        | "ENJEUX_SECTORIELS"
        | "QUESTIONS_RDV"
        | "HYPOTHESES"
        | "PISTES_CADRAGE",
      questions: p.questions.map((q) => ({
        id: q.id,
        question: q.question,
        priority: q.priority as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
        status: q.status as "OPEN" | "ACCEPTED" | "REJECTED" | "IN_PROGRESS",
        source: q.source,
        relatedDocs: q.relatedDocs,
      })),
    }))

    return <ExplorationClient paths={serializedPaths} projectName={project.name} />
  } catch (error) {
    console.error("Failed to load exploration paths:", error)
    return <ExplorationClient paths={[]} projectName="" />
  }
}
