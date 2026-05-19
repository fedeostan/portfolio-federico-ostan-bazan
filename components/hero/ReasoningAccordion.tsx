"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { StreamingText } from "@/components/hero/StreamingText";
import { cn } from "@/lib/utils";

const COLLAPSE_TRANSITION: Transition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1],
};

interface ReasoningAccordionProps {
  text: string;
  isStreaming: boolean;
  className?: string;
}

export function ReasoningAccordion({
  text,
  isStreaming,
  className,
}: ReasoningAccordionProps) {
  const reduce = useReducedMotion();
  // `override === null` means "follow the auto rule"; once the user clicks, override becomes a sticky boolean.
  const [override, setOverride] = useState<boolean | null>(null);

  const autoOpen = isStreaming && text.length > 0;
  const open = override ?? autoOpen;

  if (text.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-muted/30 px-4 py-3",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOverride(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-muted-foreground transition-colors duration-(--duration-base) ease-(--ease-standard) hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span>How I reasoned</span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-(--duration-base) ease-(--ease-standard)",
            open ? "rotate-180" : "rotate-0",
          )}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            initial={reduce ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
            transition={reduce ? { duration: 0 } : COLLAPSE_TRANSITION}
            className="overflow-hidden"
          >
            <div className="pt-3 text-sm leading-6 text-muted-foreground">
              <StreamingText text={text} isStreaming={isStreaming} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
