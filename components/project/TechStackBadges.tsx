import { cn } from '@/lib/utils'

type TechStackBadgesProps = {
  items: string[]
  max?: number
  className?: string
}

export function TechStackBadges({ items, max = 4, className }: TechStackBadgesProps) {
  if (items.length === 0) return null

  const visible = items.slice(0, max)
  const remaining = items.length - visible.length

  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)} aria-label="Tech stack">
      {visible.map((item) => (
        <li
          key={item}
          className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-medium"
        >
          {item}
        </li>
      ))}
      {remaining > 0 ? (
        <li className="text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
          +{remaining} more
        </li>
      ) : null}
    </ul>
  )
}
