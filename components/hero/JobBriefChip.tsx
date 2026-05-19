'use client'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import type { JobBrief } from '@/lib/ingest/job-brief'

interface JobBriefChipProps {
  brief: JobBrief
  onDismiss: () => void
  className?: string
}

export function JobBriefChip({ brief, onDismiss, className }: JobBriefChipProps) {
  const label = formatLabel(brief)
  return (
    <div
      className={cn(
        'bg-accent text-foreground inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium',
        className,
      )}
      role="status"
      aria-label={`Job context attached: ${label}`}
    >
      <Icon name="Briefcase" size={14} className="shrink-0 opacity-70" />
      <span className="truncate">
        <span className="opacity-70">Job: </span>
        {label}
      </span>
      <button
        type="button"
        aria-label="Remove job context"
        onClick={(event) => {
          event.stopPropagation()
          onDismiss()
        }}
        className="hover:bg-border focus-visible:ring-ring -mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2"
      >
        <Icon name="X" size={12} />
      </button>
    </div>
  )
}

function formatLabel(brief: JobBrief): string {
  const role = brief.role.trim() || 'Role'
  const company = brief.company.trim()
  if (!company || company.toLowerCase() === 'unknown') return role
  return `${role} @ ${company}`
}
