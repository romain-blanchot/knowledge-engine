"use client"

import { useState, useEffect, useCallback } from "react"

const SECTIONS = [
  "summary",
  "backendImpacts",
  "frontendImpacts",
  "documents",
  "questions",
  "risks",
  "actions",
] as const

export type StreamingSection = (typeof SECTIONS)[number]

const SECTION_DELAY = 500

interface UseStreamingSimulationOptions {
  enabled: boolean
}

interface UseStreamingSimulationReturn {
  visibleSections: Set<StreamingSection>
  isStreaming: boolean
  isSkeleton: boolean
  reset: () => void
}

export function useStreamingSimulation({
  enabled,
}: UseStreamingSimulationOptions): UseStreamingSimulationReturn {
  const [visibleSections, setVisibleSections] = useState<Set<StreamingSection>>(
    new Set(enabled ? [] : SECTIONS),
  )
  const [isStreaming, setIsStreaming] = useState(enabled)
  const [isSkeleton, setIsSkeleton] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setVisibleSections(new Set(SECTIONS))
      setIsStreaming(false)
      setIsSkeleton(false)
      return
    }

    setIsSkeleton(true)
    setIsStreaming(true)
    setVisibleSections(new Set())

    const skeletonTimer = setTimeout(() => {
      setIsSkeleton(false)
    }, 800)

    const timers: ReturnType<typeof setTimeout>[] = [skeletonTimer]

    SECTIONS.forEach((section, index) => {
      const timer = setTimeout(
        () => {
          setVisibleSections((prev) => {
            const next = new Set(prev)
            next.add(section)
            return next
          })

          if (index === SECTIONS.length - 1) {
            setIsStreaming(false)
          }
        },
        800 + (index + 1) * SECTION_DELAY,
      )
      timers.push(timer)
    })

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [enabled])

  const reset = useCallback(() => {
    setVisibleSections(new Set())
    setIsStreaming(true)
    setIsSkeleton(true)
  }, [])

  return { visibleSections, isStreaming, isSkeleton, reset }
}
