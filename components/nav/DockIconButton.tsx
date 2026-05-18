'use client'

import type { MouseEvent } from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type DockIconButtonProps = {
  label: string
  icon: LucideIcon
  href: string
  active?: boolean
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function DockIconButton({
  label,
  icon: Icon,
  href,
  active = false,
  onClick,
}: DockIconButtonProps) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      animate={{ scale: active ? 1.1 : 1 }}
      whileHover={{ scale: active ? 1.15 : 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={cn(
        'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
        'text-foreground/70 hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active && 'bg-white text-foreground shadow-md'
      )}
    >
      <Icon size={active ? 22 : 20} strokeWidth={active ? 2.25 : 1.75} />
      <span
        className={cn(
          'pointer-events-none absolute -top-9 rounded-md border border-border bg-popover px-2 py-1',
          'text-xs font-medium text-popover-foreground shadow-sm',
          'opacity-0 transition-opacity duration-150',
          'group-hover:opacity-100 group-focus-visible:opacity-100'
        )}
      >
        {label}
      </span>
    </motion.a>
  )
}
