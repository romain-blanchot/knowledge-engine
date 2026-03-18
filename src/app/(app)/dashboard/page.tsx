import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { DashboardClient } from "@/components/features/dashboard/dashboard-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Vue projet — Frogia",
  description: "Vue d'ensemble du projet actif",
}

export default async function DashboardPage() {
  try {
    const project = await prisma.project.findFirst({
      where: { status: "ACTIVE" },
      include: {
        issues: {
          orderBy: { createdAt: "desc" },
        },
        documents: {
          select: { id: true, title: true, category: true },
        },
        decisions: {
          select: { id: true, title: true, status: true },
        },
        explorations: {
          include: {
            questions: {
              select: { id: true, status: true, question: true },
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

    if (!project) {
      return <DashboardClient data={null} />
    }

    const data = {
      id: project.id,
      name: project.name,
      client: project.client,
      industry: project.industry,
      phase: project.phase,
      summary: project.summary ?? "",
      description: project.description,
      lastActivity: project.lastActivity.toISOString(),
      issues: project.issues.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        severity: i.severity,
        resolved: i.resolved,
      })),
      documents: project.documents.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category,
      })),
      decisions: project.decisions.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
      })),
      explorations: project.explorations.map((e) => ({
        id: e.id,
        category: e.category,
        questions: e.questions.map((q) => ({
          id: q.id,
          status: q.status,
          question: q.question,
        })),
      })),
      activities: project.activities.map((a) => ({
        id: a.id,
        type: a.type,
        description: a.description,
        createdAt: a.createdAt.toISOString(),
      })),
    }

    return <DashboardClient data={data} />
  } catch (error) {
    console.error("Failed to load dashboard data:", error)
    return <DashboardClient data={null} />
  }
}
