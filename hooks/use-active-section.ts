'use client'

import { useEffect, useState } from 'react'

type UseActiveSectionOptions = {
  /** Top offset in CSS units (e.g. '-20%') trimming the observer root from the top. */
  rootMarginTop?: string
  /** Bottom offset (e.g. '-40%') trimming the observer root from the bottom. */
  rootMarginBottom?: string
  /** Intersection thresholds; defaults bias toward sections near the viewport center. */
  thresholds?: number[]
}

/**
 * Tracks which section id is currently "active" based on IntersectionObserver.
 *
 * Returns the id of the most-prominent section in view, or null before any
 * observation has fired (server / first paint).
 */
export function useActiveSection(
  sectionIds: readonly string[],
  options: UseActiveSectionOptions = {},
): string | null {
  const {
    rootMarginTop = '-20%',
    rootMarginBottom = '-40%',
    thresholds = [0.4, 0.6],
  } = options

  const [active, setActive] = useState<string | null>(null)

  const idsKey = sectionIds.join(',')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ids = idsKey ? idsKey.split(',') : []
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        const top = visible[0]
        if (top) setActive(top.target.id)
      },
      {
        threshold: thresholds,
        rootMargin: `${rootMarginTop} 0px ${rootMarginBottom} 0px`,
      },
    )

    elements.forEach((el) => observer.observe(el))

    // Edge cases: top of page → first id, bottom of page → last id.
    // The IntersectionObserver alone can miss these when the viewport sits
    // outside the trimmed root margins (e.g. user lands on the hero, or
    // scrolls to the very end and the last section's center is below the
    // bottom margin).
    const firstId = ids[0]
    const lastId = ids[ids.length - 1]

    const handleEdges = () => {
      const scrollY = window.scrollY
      const viewportBottom = scrollY + window.innerHeight
      const docHeight = document.documentElement.scrollHeight

      // TODO(user): decide thresholds for "at top" and "at bottom".
      // Suggested approach: if scrollY < some small px → firstId; if
      // viewportBottom >= docHeight - some px → lastId. Tune the px values
      // so behaviour feels stable on slow + fast scrolls.
      if (scrollY < 80 && firstId) {
        setActive(firstId)
        return
      }
      if (viewportBottom >= docHeight - 80 && lastId) {
        setActive(lastId)
      }
    }

    handleEdges()
    window.addEventListener('scroll', handleEdges, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleEdges)
    }
  }, [idsKey, rootMarginTop, rootMarginBottom, thresholds])

  return active
}
