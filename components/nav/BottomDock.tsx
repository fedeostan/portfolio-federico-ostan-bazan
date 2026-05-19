'use client'

import { useMemo, useState } from 'react'
import {
  AnimatePresence,
  MotionConfig,
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
  /** Forces the dock orientation. Useful for stories / tests. */
  orientation?: 'horizontal' | 'vertical'
  onItemClick?: (key: DockItemKey) => void
  className?: string
}

const SHOW_AFTER_SCROLL_PX = 100
const VERTICAL_SECTION_ID = 'section-contact'
const PIVOT_TRANSITION = { type: 'spring' as const, stiffness: 200, damping: 30 }

export function BottomDock({
  activeKey,
  orientation: orientationProp,
  onItemClick,
  className,
}: BottomDockProps) {
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

  const orientation: 'horizontal' | 'vertical' =
    orientationProp ??
    (activeSectionId === VERTICAL_SECTION_ID ? 'vertical' : 'horizontal')

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

  const tooltipSide = orientation === 'vertical' ? 'left' : 'top'

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn(
          'pointer-events-none fixed inset-0 z-50 flex',
          orientation === 'horizontal'
            ? 'items-end justify-center pb-6'
            : 'items-center justify-end pr-6',
          className,
        )}
      >
        <AnimatePresence>
          {visible && (
            <motion.nav
              layout
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={PIVOT_TRANSITION}
              aria-label="Section navigation"
              className={cn(
                'pointer-events-auto flex gap-1 rounded-full border border-border/60 bg-background/70 p-2',
                'shadow-lg backdrop-blur-lg',
                orientation === 'vertical'
                  ? 'flex-col items-center'
                  : 'flex-row items-center',
              )}
            >
              {dockItems.map((item) => (
                <DockIconButton
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  href={item.anchor}
                  active={resolvedActiveKey === item.key}
                  tooltipSide={tooltipSide}
                  onClick={(event) => {
                    event.preventDefault()
                    handleClick(item.key, item.anchor)
                  }}
                />
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
