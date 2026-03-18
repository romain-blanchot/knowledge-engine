import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { ProjectDetailClient } from "@/components/features/projects/project-detail-client"

export const dynamic = "force-dynamic"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

interface DocumentSelect {
  id: string
  title: string
  category: string
  status: string
  ragIndexed: boolean
}

interface ApiEndpointSelect {
  id: string
  method: string
  route: string
  service: string
}

interface DecisionSelect {
  id: string
  title: string
  status: string
  author: string
}

interface ConversationSelect {
  id: string
  title: string
  createdAt: Date
}

interface AnalysisSelect {
  id: string
  title: string
  feature: string
  complexityScore: number
}

interface ActivitySelect {
  id: string
  type: string
  description: string
  createdAt: Date
}

interface ProjectWithRelations {
  id: string
  name: string
  client: string
  description: string
  status: string
  industry: string
  completionScore: number
  lastActivity: Date
  createdAt: Date
  documents: DocumentSelect[]
  apiEndpoints: ApiEndpointSelect[]
  decisions: DecisionSelect[]
  conversations: ConversationSelect[]
  analyses: AnalysisSelect[]
  activities: ActivitySelect[]
  _count: {
    documents: number
    apiEndpoints: number
    decisions: number
    conversations: number
    analyses: number
    explorations: number
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true },
    })
    return {
      title: project ? `${project.name} — Frogia` : "Projet — Frogia",
      description: "Détails du projet",
    }
  } catch {
    return {
      title: "Projet — Frogia",
      description: "Détails du projet",
    }
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { id } = await params

  try {
    const project: ProjectWithRelations | null = await prisma.project.findUnique({
      where: { id },
      include: {
        documents: {
          select: { id: true, title: true, category: true, status: true, ragIndexed: true },
          orderBy: { updatedAt: "desc" },
          take: 5,
        },
        apiEndpoints: {
          select: { id: true, method: true, route: true, service: true },
          orderBy: { updatedAt: "desc" },
          take: 5,
        },
        decisions: {
          select: { id: true, title: true, status: true, author: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        conversations: {
          select: { id: true, title: true, createdAt: true },
          orderBy: { updatedAt: "desc" },
          take: 5,
        },
        analyses: {
          select: { id: true, title: true, feature: true, complexityScore: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        activities: {
          select: { id: true, type: true, description: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            documents: true,
            apiEndpoints: true,
            decisions: true,
            conversations: true,
            analyses: true,
            explorations: true,
          },
        },
      },
    })

    if (!project) {
      notFound()
    }

    const data = {
      id: project.id,
      name: project.name,
      client: project.client,
      description: project.description,
      status: project.status,
      industry: project.industry,
      completionScore: project.completionScore,
      lastActivity: project.lastActivity.toISOString(),
      createdAt: project.createdAt.toISOString(),
      counts: project._count,
      recentDocuments: project.documents.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        status: d.status,
        ragIndexed: d.ragIndexed,
      })),
      recentApiEndpoints: project.apiEndpoints.map((a) => ({
        id: a.id,
        method: a.method,
        route: a.route,
        service: a.service,
      })),
      recentDecisions: project.decisions.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        author: d.author,
      })),
      recentConversations: project.conversations.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt.toISOString(),
      })),
      recentAnalyses: project.analyses.map((a) => ({
        id: a.id,
        title: a.title,
        feature: a.feature,
        complexityScore: a.complexityScore,
      })),
      recentActivities: project.activities.map((a) => ({
        id: a.id,
        type: a.type,
        description: a.description,
        createdAt: a.createdAt.toISOString(),
      })),
    }

    return <ProjectDetailClient data={data} />
  } catch (error) {
    // Re-throw Next.js navigation errors (notFound, redirect)
    if (error instanceof Error && "digest" in error) {
      throw error
    }
    console.error("Failed to load project details:", error)
    notFound()
  }
}
