import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { DashboardClient } from "@/components/features/dashboard/dashboard-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Tableau de bord — Frogia",
  description: "Vue d'ensemble du projet actif",
}

interface ProjectWithRelations {
  id: string
  name: string
  client: string
  description: string
  status: string
  completionScore: number
  lastActivity: Date
  documents: { id: string; ragIndexed: boolean }[]
  apiEndpoints: { id: string }[]
  conversations: { id: string }[]
  analyses: { id: string }[]
  decisions: { id: string }[]
  explorations: { questions: { id: string }[] }[]
  activities: { id: string; type: string; description: string; createdAt: Date }[]
}

export default async function DashboardPage() {
  try {
    const project: ProjectWithRelations | null = await prisma.project.findFirst({
      where: { status: "ACTIVE" },
      include: {
        documents: { select: { id: true, ragIndexed: true } },
        apiEndpoints: { select: { id: true } },
        conversations: { select: { id: true } },
        analyses: { select: { id: true } },
        decisions: { select: { id: true } },
        explorations: {
          include: {
            questions: {
              where: { status: "OPEN" },
              select: { id: true },
            },
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 8,
          select: {
            id: true,
            type: true,
            description: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastActivity: "desc" },
    })

    const openQuestionCount =
      project?.explorations.reduce((sum: number, e) => sum + e.questions.length, 0) ?? 0

    const lastRagActivity: { createdAt: Date } | null = project
      ? await prisma.activity.findFirst({
          where: { projectId: project.id, type: "rag_sync" },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        })
      : null

    const data = {
      project: project
        ? {
            id: project.id,
            name: project.name,
            client: project.client,
            description: project.description,
            status: project.status,
            completionScore: project.completionScore,
            lastActivity: project.lastActivity.toISOString(),
          }
        : null,
      kpis: {
        documentsIndexed: project?.documents.filter((d) => d.ragIndexed).length ?? 0,
        apiEndpoints: project?.apiEndpoints.length ?? 0,
        openQuestions: openQuestionCount,
        decisions: project?.decisions.length ?? 0,
        analyses: project?.analyses.length ?? 0,
        conversations: project?.conversations.length ?? 0,
      },
      recentActivities: (project?.activities ?? []).map((a) => ({
        id: a.id,
        type: a.type,
        description: a.description,
        createdAt: a.createdAt.toISOString(),
      })),
      lastSyncDate: lastRagActivity?.createdAt.toISOString() ?? null,
    }

    return <DashboardClient data={data} />
  } catch (error) {
    console.error("Failed to load dashboard data:", error)
    return (
      <DashboardClient
        data={{
          project: null,
          kpis: {
            documentsIndexed: 0,
            apiEndpoints: 0,
            openQuestions: 0,
            decisions: 0,
            analyses: 0,
            conversations: 0,
          },
          recentActivities: [],
          lastSyncDate: null,
        }}
      />
    )
  }
}
