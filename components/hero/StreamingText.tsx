"use client";

import {
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { useEffect, useMemo, useRef } from "react";

import { cn } from "@/lib/utils";

const WORD_TRANSITION: Transition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
};

const ACTIVE_WINDOW = 16;

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  className?: string;
}

export function StreamingText({
  text,
  isStreaming,
  className,
}: StreamingTextProps) {
  const reduce = useReducedMotion();
  const prevCountRef = useRef(0);

  const tokens = useMemo(
    () => text.split(/(\s+)/).filter((t) => t.length > 0),
    [text],
  );
  const totalCount = tokens.length;
  const prevCount = prevCountRef.current;

  useEffect(() => {
    prevCountRef.current = totalCount;
  });

  if (reduce) {
    return (
      <p
        aria-busy={isStreaming || undefined}
        className={cn("whitespace-pre-wrap", className)}
      >
        {text}
      </p>
    );
  }

  const settledThreshold = Math.max(0, totalCount - ACTIVE_WINDOW);
  const settled = tokens.slice(0, settledThreshold).join("");
  const activeTokens = tokens.slice(settledThreshold);

  return (
    <p
      aria-busy={isStreaming || undefined}
      className={cn("whitespace-pre-wrap", className)}
    >
      {settled.length > 0 ? <span>{settled}</span> : null}
      {/* eslint-disable-next-line react-hooks/refs -- intentional: prevCount is read from ref before useEffect to diff new tokens during render */}
      {activeTokens.map((tok, i) => {
        const absoluteIndex = settledThreshold + i;
        if (/^\s+$/.test(tok)) {
          return <span key={`ws-${absoluteIndex}`}>{tok}</span>;
        }
        const isNew = absoluteIndex >= prevCount;
        return (
          <motion.span
            key={`w-${absoluteIndex}`}
            initial={isNew ? { opacity: 0, filter: "blur(8px)" } : false}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={WORD_TRANSITION}
            style={{ display: "inline-block" }}
          >
            {tok}
          </motion.span>
        );
      })}
    </p>
  );
}
