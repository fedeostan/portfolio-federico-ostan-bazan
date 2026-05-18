'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'
import type { ProjectCardProps } from '@/types/project'

type Props = ProjectCardProps & {
  className?: string
  href?: string
  priority?: boolean
}

export function ProjectCard({
  slug,
  title,
  summary,
  og_image,
  role,
  className,
  href,
  priority = false,
}: Props) {
  const reduce = useReducedMotion()
  const link = href ?? `/case-studies/${slug}`

  const cardClass = cn(
    'group/card relative flex h-full flex-col overflow-hidden rounded-4xl bg-card ring-1 ring-border',
    'focus-within:ring-2 focus-within:ring-ring',
    className,
  )

  const inner = (
    <Link
      href={link}
      className="flex h-full flex-col outline-none"
      aria-label={`Read more about ${title}`}
    >
      <div className="bg-muted relative aspect-[3/4] w-full overflow-hidden">
        {og_image ? (
          <Image
            src={og_image}
            alt={title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 80vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        {role ? (
          <span className="text-muted-foreground text-xs font-medium tracking-wide">{role}</span>
        ) : null}
        <h3 className="font-heading text-foreground text-xl leading-tight font-semibold">
          {title}
        </h3>
        <p className="text-muted-foreground line-clamp-2 text-sm">{summary}</p>
        <span className="text-foreground mt-auto inline-flex items-center gap-2 pt-3 text-xs font-medium">
          Read more
          <ArrowRight
            className="size-3.5 transition-transform duration-(--duration-base) ease-(--ease-standard) group-hover/card:translate-x-0.5"
            strokeWidth={2}
            aria-hidden
          />
        </span>
      </div>
    </Link>
  )

  if (reduce) {
    return <article className={cardClass}>{inner}</article>
  }

  return (
    <motion.article
      className={cardClass}
      whileHover={{
        y: -4,
        scale: 1.02,
        boxShadow: '0 4px 6px -4px rgba(0,0,0,0.10), 0 10px 15px -3px rgba(0,0,0,0.10)',
      }}
      transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
    >
      {inner}
    </motion.article>
  )
}
