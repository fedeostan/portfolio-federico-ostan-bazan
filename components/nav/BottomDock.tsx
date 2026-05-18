'use client'

import { useEffect, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react'

import { cn } from '@/lib/utils'

import { DockIconButton } from './DockIconButton'
import { dockItems, type DockItemKey } from './dock-items'

type BottomDockProps = {
  activeKey?: DockItemKey
  onItemClick?: (key: DockItemKey) => void
  className?: string
}

const SHOW_AFTER_SCROLL_PX = 100

export function BottomDock({ activeKey, onItemClick, className }: BottomDockProps) {
  const { scrollY } = useScroll()
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [spyKey, setSpyKey] = useState<DockItemKey | undefined>(undefined)

  useMotionValueEvent(scrollY, 'change', (value) => {
    if (!visible && value > SHOW_AFTER_SCROLL_PX) {
      setVisible(true)
    }
  })

  useEffect(() => {
    if (activeKey !== undefined) return

    const entries = dockItems
      .map((item) => {
        const id = item.anchor.replace(/^#/, '')
        const el = document.getElementById(id)
        return el ? { key: item.key, el } : null
      })
      .filter((x): x is { key: DockItemKey; el: HTMLElement } => x !== null)

    if (entries.length === 0) return

    const visibility = new Map<DockItemKey, number>()
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const match = entries.find((e) => e.el === record.target)
          if (match) visibility.set(match.key, record.intersectionRatio)
        }
        let best: DockItemKey | undefined
        let bestRatio = 0
        for (const [key, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = key
          }
        }
        setSpyKey(bestRatio > 0 ? best : undefined)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    for (const { el } of entries) observer.observe(el)
    return () => observer.disconnect()
  }, [activeKey])

  const resolvedActiveKey = activeKey ?? spyKey

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={cn(
            'fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
            className
          )}
        >
          <motion.div
            animate={reduce ? undefined : { y: [-2, 2, -2] }}
            transition={
              reduce
                ? undefined
                : { duration: 4, ease: 'easeInOut', repeat: Infinity }
            }
            className={cn(
              'flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2 py-2',
              'shadow-lg backdrop-blur-lg'
            )}
            role="navigation"
            aria-label="Section navigation"
          >
            {dockItems.map((item) => (
              <DockIconButton
                key={item.key}
                label={item.label}
                icon={item.icon}
                href={item.anchor}
                active={resolvedActiveKey === item.key}
                onClick={onItemClick ? () => onItemClick(item.key) : undefined}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
