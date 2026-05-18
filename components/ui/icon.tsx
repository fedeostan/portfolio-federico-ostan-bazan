import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type IconName = {
  [K in keyof typeof LucideIcons]: (typeof LucideIcons)[K] extends LucideIcon
    ? K
    : never
}[keyof typeof LucideIcons]

type IconProps = {
  name: IconName
  className?: string
  size?: number
  strokeWidth?: number
}

export function Icon({
  name,
  className,
  size = 20,
  strokeWidth = 1.75,
}: IconProps) {
  const LucideComponent = LucideIcons[name] as LucideIcon
  return (
    <LucideComponent
      size={size}
      strokeWidth={strokeWidth}
      className={cn(className)}
    />
  )
}
