import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { ChatClient } from "@/components/features/chat/chat-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Assistant — Frogia",
  description: "Assistant conversationnel de connaissance projet",
}

export default async function ChatPage() {
  try {
    const project = await prisma.project.findFirst({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
    })

    const conversations = await prisma.conversation.findMany({
      where: { projectId: project?.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialized = conversations.map((conv: any) => ({
      id: conv.id,
      title: conv.title,
      projectId: conv.projectId,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: conv.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        summary: msg.summary,
        operationalImpacts: msg.operationalImpacts,
        clientImpacts: msg.clientImpacts,
        documentsUsed: msg.documentsUsed,
        processesUsed: msg.processesUsed,
        openQuestions: msg.openQuestions,
        risks: msg.risks,
        suggestedActions: msg.suggestedActions,
        confidenceScore: msg.confidenceScore,
        conversationId: msg.conversationId,
        createdAt: msg.createdAt.toISOString(),
      })),
    }))

    return <ChatClient conversations={serialized} projectName={project?.name} />
  } catch (error) {
    console.error("Failed to load chat data:", error)
    return <ChatClient conversations={[]} projectName={undefined} />
  }
}
