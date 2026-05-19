"use client";

import { cn } from "@/lib/utils";

interface ProjectCardSkeletonProps {
  className?: string;
}

export function ProjectCardSkeleton({ className }: ProjectCardSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading project card"
      className={cn(
        "relative aspect-[34/43] w-full overflow-hidden rounded-4xl bg-card ring-1 ring-border",
        className,
      )}
    >
      <div
        aria-hidden
        className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.06)_50%,transparent_75%)] bg-[length:200%_100%]"
        style={{ animation: "shimmer 1.5s linear infinite" }}
      />
      <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6">
        <div className="h-3 w-1/3 rounded-full bg-muted/60" />
        <div className="h-5 w-2/3 rounded-full bg-muted/60" />
        <div className="h-4 w-full rounded-full bg-muted/50" />
        <div className="h-4 w-4/5 rounded-full bg-muted/50" />
      </div>
    </div>
  );
}
