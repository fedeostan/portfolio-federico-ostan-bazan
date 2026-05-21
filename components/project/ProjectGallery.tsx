"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { ProjectCardProps } from "@/types/project";

import { ProjectCard } from "./ProjectCard";

type ProjectGalleryProps = {
  items: ProjectCardProps[];
  className?: string;
};

export function ProjectGallery({ items, className }: ProjectGalleryProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setCurrent(api.selectedScrollSnap());
    };
    update();
    api.on("reInit", update);
    api.on("select", update);
    return () => {
      api.off("reInit", update);
      api.off("select", update);
    };
  }, [api]);

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div className="hidden items-center justify-end gap-2 px-6 md:flex md:px-12 2xl:px-[max(8rem,calc(50vw-700px))]">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => api?.scrollPrev()}
          disabled={!canScrollPrev}
          aria-label="Previous projects"
          className="disabled:pointer-events-auto"
        >
          <ArrowLeft className="size-5" strokeWidth={2} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => api?.scrollNext()}
          disabled={!canScrollNext}
          aria-label="Next projects"
          className="disabled:pointer-events-auto"
        >
          <ArrowRight className="size-5" strokeWidth={2} />
        </Button>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          breakpoints: {
            "(max-width: 768px)": { dragFree: true },
          },
        }}
        className="w-full"
      >
        <CarouselContent className="ml-0 px-6 md:px-12 2xl:ml-[max(8rem,calc(50vw-700px))] 2xl:mr-[max(0rem,calc(50vw-700px))] 2xl:px-0">
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className="max-w-[320px] pl-[20px] lg:max-w-[360px]"
            >
              <ProjectCard {...item} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div
        className="flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Gallery pagination"
      >
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={current === i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={cn(
              "size-2 rounded-full transition-colors duration-(--duration-base) ease-(--ease-standard)",
              current === i ? "bg-foreground" : "bg-foreground/20",
            )}
          />
        ))}
      </div>
    </div>
  );
}
