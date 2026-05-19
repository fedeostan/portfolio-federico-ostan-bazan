"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const TOOL_LABELS: Record<string, string> = {
  "tool-search_projects": "Searching projects…",
  "tool-get_project_detail": "Reading case study…",
};

interface ToolStatusPillProps {
  activeTool: string | null;
  className?: string;
}

export function ToolStatusPill({
  activeTool,
  className,
}: ToolStatusPillProps) {
  const reduce = useReducedMotion();
  const label = activeTool ? (TOOL_LABELS[activeTool] ?? "Working…") : null;

  return (
    <AnimatePresence>
      {label ? (
        <motion.div
          key={label}
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground",
            className,
          )}
        >
          <span
            aria-hidden
            className="size-1.5 animate-pulse rounded-full bg-foreground/50"
          />
          {label}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
