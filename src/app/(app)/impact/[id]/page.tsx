import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { ImpactDetailClient } from "@/components/features/impact/impact-detail-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Détail de l'analyse d'impact — Frogia",
  description: "Rapport détaillé d'analyse d'impact",
}

export default async function ImpactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const analysis = await prisma.impactAnalysis.findUnique({
      where: { id },
    })

    if (!analysis) {
      notFound()
    }

    const serialized = {
      id: analysis.id,
      title: analysis.title,
      feature: analysis.feature,
      complexityScore: analysis.complexityScore,
      confidenceScore: analysis.confidenceScore,
      functionalImpact: analysis.functionalImpact,
      backendImpact: analysis.backendImpact,
      frontendImpact: analysis.frontendImpact,
      dataImpact: analysis.dataImpact,
      securityImpact: analysis.securityImpact,
      testingImpact: analysis.testingImpact,
      risks: analysis.risks,
      recommendations: analysis.recommendations,
      sourceDocs: analysis.sourceDocs,
      impactedEndpoints: analysis.impactedEndpoints,
      impactedComponents: analysis.impactedComponents,
      createdAt: analysis.createdAt.toISOString(),
    }

    return <ImpactDetailClient analysis={serialized} />
  } catch (error) {
    // Re-throw Next.js navigation errors (notFound, redirect)
    if (error instanceof Error && "digest" in error) {
      throw error
    }
    console.error("Failed to load impact analysis:", error)
    notFound()
  }
}
