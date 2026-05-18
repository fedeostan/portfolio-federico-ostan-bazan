'use client'

import { useMemo, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react'

import { useActiveSection } from '@/hooks/use-active-section'
import { cn } from '@/lib/utils'

import { DockIconButton } from './DockIconButton'
import { dockItems, type DockItemKey } from './dock-items'

type BottomDockProps = {
  /** Overrides the auto-detected active section. Useful for stories / tests. */
  activeKey?: DockItemKey
  onItemClick?: (key: DockItemKey) => void
  className?: string
}

const SHOW_AFTER_SCROLL_PX = 100

export function BottomDock({ activeKey, onItemClick, className }: BottomDockProps) {
  const { scrollY } = useScroll()
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(false)

  const sectionIds = useMemo(
    () => dockItems.map((item) => item.anchor.slice(1)),
    [],
  )
  const activeSectionId = useActiveSection(sectionIds)
  const resolvedActiveKey: DockItemKey | undefined =
    activeKey ??
    dockItems.find((item) => item.anchor.slice(1) === activeSectionId)?.key

  useMotionValueEvent(scrollY, 'change', (value) => {
    if (!visible && value > SHOW_AFTER_SCROLL_PX) {
      setVisible(true)
    }
  })

  const handleClick = (key: DockItemKey, anchor: string) => {
    if (typeof document !== 'undefined') {
      const target = document.getElementById(anchor.slice(1))
      if (target) {
        target.scrollIntoView({
          behavior: reduce ? 'auto' : 'smooth',
          block: 'start',
        })
      }
    }
    onItemClick?.(key)
  }

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
                onClick={(event) => {
                  event.preventDefault()
                  handleClick(item.key, item.anchor)
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
