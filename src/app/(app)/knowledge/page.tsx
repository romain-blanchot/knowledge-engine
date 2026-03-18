import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { KnowledgeClient } from "@/components/features/knowledge/knowledge-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Base de connaissances — Frogia",
  description: "Gestion et consultation de la base documentaire projet",
}

export default async function KnowledgePage() {
  try {
    const project = await prisma.project.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { lastActivity: "desc" },
    })

    const documents = await prisma.document.findMany({
      where: { projectId: project?.id },
      include: {
        sections: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            highlighted: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    const serializedDocuments = documents.map((doc: (typeof documents)[number]) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      status: doc.status,
      summary: doc.summary,
      content: doc.content,
      author: doc.author,
      tags: doc.tags,
      ragIndexed: doc.ragIndexed,
      needsClarification: doc.needsClarification,
      sectionsCount: doc.sectionsCount,
      sections: doc.sections,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    }))

    return <KnowledgeClient documents={serializedDocuments} />
  } catch (error) {
    console.error("Failed to load knowledge base:", error)
    return <KnowledgeClient documents={[]} />
  }
}
