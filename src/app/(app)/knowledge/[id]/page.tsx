import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { DocumentDetailClient } from "@/components/features/knowledge/document-detail-client"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const document = await prisma.document.findUnique({
      where: { id },
      select: { title: true },
    })

    return {
      title: document ? `${document.title} — Frogia` : "Document introuvable — Frogia",
      description: "Detail du document de la base de connaissances",
    }
  } catch {
    return {
      title: "Document — Frogia",
      description: "Detail du document de la base de connaissances",
    }
  }
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!document) {
      notFound()
    }

    const serializedDocument = {
      id: document.id,
      title: document.title,
      category: document.category,
      status: document.status,
      summary: document.summary,
      content: document.content,
      author: document.author,
      tags: document.tags,
      ragIndexed: document.ragIndexed,
      needsClarification: document.needsClarification,
      sectionsCount: document.sectionsCount,
      sections: document.sections.map((s: (typeof document.sections)[number]) => ({
        id: s.id,
        title: s.title,
        content: s.content,
        order: s.order,
        highlighted: s.highlighted,
      })),
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    }

    return <DocumentDetailClient document={serializedDocument} />
  } catch (error) {
    // Re-throw Next.js navigation errors (notFound, redirect)
    if (error instanceof Error && "digest" in error) {
      throw error
    }
    console.error("Failed to load document:", error)
    notFound()
  }
}
