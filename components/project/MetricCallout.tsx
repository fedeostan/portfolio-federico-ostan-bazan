import { cn } from '@/lib/utils'

type MetricCalloutProps = {
  n: number | string
  label: string
  prefix?: string
  suffix?: string
  className?: string
}

export function MetricCallout({ n, label, prefix, suffix, className }: MetricCalloutProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <span
        className="font-heading text-foreground text-4xl leading-none font-semibold tracking-tight md:text-6xl"
        aria-label={`${prefix ?? ''}${n}${suffix ?? ''} ${label}`}
      >
        {prefix ? <span aria-hidden>{prefix}</span> : null}
        <span aria-hidden>{n}</span>
        {suffix ? <span aria-hidden>{suffix}</span> : null}
      </span>
      <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
        {label}
      </span>
    </div>
  )
}
