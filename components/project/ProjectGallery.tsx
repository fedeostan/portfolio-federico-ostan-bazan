'use client'

import * as React from 'react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import type { ProjectCardProps } from '@/types/project'

import { ProjectCard } from './ProjectCard'

type ProjectGalleryProps = {
  items: ProjectCardProps[]
  title?: string
  description?: string
  className?: string
}

export function ProjectGallery({ items, title, description, className }: ProjectGalleryProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [snapCount, setSnapCount] = React.useState(0)
  const [selected, setSelected] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const update = () => {
      setSnapCount(api.scrollSnapList().length)
      setSelected(api.selectedScrollSnap())
    }
    update()
    api.on('reInit', update)
    api.on('select', update)
    return () => {
      api.off('reInit', update)
      api.off('select', update)
    }
  }, [api])

  return (
    <section className={cn('w-full', className)}>
      {(title || description) && (
        <header className="mb-12 max-w-2xl px-6 md:px-12">
          {title ? (
            <h2 className="font-heading text-foreground text-2xl leading-tight font-semibold">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="text-muted-foreground mt-6 text-base">{description}</p>
          ) : null}
        </header>
      )}

      <Carousel
        setApi={setApi}
        opts={{ align: 'start', loop: false, dragFree: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-6 px-6 md:px-12">
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className="basis-[80%] pl-6 sm:basis-[55%] md:basis-[40%] lg:basis-[28%]"
            >
              <ProjectCard {...item} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="mt-8 flex items-center justify-between gap-6 px-6 md:px-12">
          <div className="flex items-center gap-2" aria-hidden>
            {Array.from({ length: snapCount }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-(--duration-base) ease-(--ease-standard)',
                  i === selected ? 'bg-foreground w-6' : 'bg-foreground/20 w-1.5',
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <CarouselPrevious className="relative top-0 left-0 translate-y-0" />
            <CarouselNext className="relative top-0 right-0 translate-y-0" />
          </div>
        </div>
      </Carousel>
    </section>
  )
}
