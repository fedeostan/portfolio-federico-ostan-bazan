"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProjectCardProps } from "@/types/project";

type Props = ProjectCardProps & {
  className?: string;
  href?: string;
};

export function ProjectCard({
  slug,
  title,
  summary,
  og_image,
  role,
  className,
  href,
}: Props) {
  const link = href ?? `/case-studies/${slug}`;
  const hasImage = Boolean(og_image);

  return (
    <Link
      href={link}
      aria-label={`Read more about ${title}`}
      className={cn(
        "group/card relative flex aspect-[34/43] w-full flex-col justify-end overflow-hidden rounded-4xl bg-card outline-none ring-1 ring-border transition-shadow duration-(--duration-base) ease-(--ease-standard) hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {hasImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={og_image as string}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-(--duration-slow) ease-(--ease-standard) group-hover/card:scale-105"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.45)_55%,rgba(0,0,0,0.78)_100%)]"
          />
        </>
      ) : null}

      <div
        className={cn(
          "relative flex flex-col gap-6 p-6",
          hasImage ? "text-primary-foreground" : "text-foreground",
        )}
      >
        <div className="flex flex-col gap-3">
          {role ? (
            <span
              className={cn(
                "text-xs font-medium tracking-wide",
                hasImage ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {role}
            </span>
          ) : null}
          <h3
            className={cn(
              "font-heading text-xl leading-7 font-semibold",
              hasImage ? "text-primary-foreground" : "text-foreground",
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "line-clamp-2 text-base leading-6 font-medium",
              hasImage ? "text-primary-foreground/85" : "text-muted-foreground",
            )}
          >
            {summary}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-3 text-xs font-medium",
            hasImage ? "text-primary-foreground" : "text-foreground",
          )}
        >
          Read more
          <ArrowRight
            className="size-4 transition-transform duration-(--duration-base) ease-(--ease-standard) group-hover/card:translate-x-1"
            strokeWidth={2}
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
