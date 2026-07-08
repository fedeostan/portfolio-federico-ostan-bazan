import { cn } from '@/lib/utils'

type MetricCalloutProps = {
  n: number | string
  label: string
  prefix?: string
  suffix?: string
  className?: string
}

function sizeClassFor(value: string): string {
  const length = value.length
  if (length <= 3) return 'text-4xl md:text-6xl'
  if (length <= 10) return 'text-3xl md:text-5xl'
  if (length <= 20) return 'text-2xl md:text-4xl'
  if (length <= 35) return 'text-xl md:text-3xl'
  return 'text-lg md:text-2xl'
}

export function MetricCallout({ n, label, prefix, suffix, className }: MetricCalloutProps) {
  const displayValue = `${prefix ?? ''}${n}${suffix ?? ''}`
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <span
        className={cn(
          'font-heading text-foreground leading-tight font-semibold tracking-tight',
          sizeClassFor(displayValue),
        )}
        aria-label={`${displayValue} ${label}`}
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
