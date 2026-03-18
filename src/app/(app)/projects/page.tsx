import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { ProjectsClient } from "@/components/features/projects/projects-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Projets — Frogia",
  description: "Liste des espaces de travail et projets clients",
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
  documents: { id: string }[]
  apiEndpoints: { id: string }[]
  decisions: { id: string }[]
}

export default async function ProjectsPage() {
  try {
    const projects: ProjectWithRelations[] = await prisma.project.findMany({
      include: {
        documents: { select: { id: true } },
        apiEndpoints: { select: { id: true } },
        decisions: { select: { id: true } },
      },
      orderBy: { lastActivity: "desc" },
    })

    const serializedProjects = projects.map((p) => ({
      id: p.id,
      name: p.name,
      client: p.client,
      description: p.description,
      status: p.status,
      industry: p.industry,
      completionScore: p.completionScore,
      lastActivity: p.lastActivity.toISOString(),
      documentsCount: p.documents.length,
      apiEndpointsCount: p.apiEndpoints.length,
      decisionsCount: p.decisions.length,
    }))

    const industries = [...new Set(projects.map((p) => p.industry))].sort()

    return <ProjectsClient projects={serializedProjects} industries={industries} />
  } catch (error) {
    console.error("Failed to load projects:", error)
    return <ProjectsClient projects={[]} industries={[]} />
  }
}
