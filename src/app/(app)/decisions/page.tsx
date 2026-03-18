import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { DecisionsClient } from "@/components/features/decisions/decisions-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Journal des décisions — Frogia",
  description: "Historique et enregistrement des décisions projet",
}

export default async function DecisionsPage() {
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
            Créez un projet pour accéder au journal des décisions.
          </p>
        </div>
      )
    }

    const decisions = await prisma.decision.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
    })

    const serializedDecisions = decisions.map((d) => ({
      id: d.id,
      title: d.title,
      context: d.context,
      justification: d.justification,
      impact: d.impact,
      author: d.author,
      status: d.status as "APPROVED" | "PENDING" | "REJECTED" | "SUPERSEDED",
      inputType: d.inputType as "TEXT" | "AUDIO" | "FILE",
      transcript: d.transcript,
      synthesis: d.synthesis,
      relatedDocs: d.relatedDocs,
      createdAt: d.createdAt.toISOString(),
    }))

    return <DecisionsClient decisions={serializedDecisions} projectName={project.name} />
  } catch (error) {
    console.error("Failed to load decisions:", error)
    return <DecisionsClient decisions={[]} projectName="" />
  }
}
