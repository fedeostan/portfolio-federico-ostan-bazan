"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";

import { transitions } from "@/lib/motion-config";
import { cn } from "@/lib/utils";

interface HeroTitleProps {
  text: string;
  animateInitial?: boolean;
  transition?: Transition;
  className?: string;
}

export function HeroTitle({
  text,
  animateInitial = true,
  transition = transitions.blurReveal,
  className,
}: HeroTitleProps) {
  const reduce = useReducedMotion();

  return (
    <h1
      aria-live="polite"
      className={cn(
        "grid place-items-center text-balance text-center font-sans text-2xl font-medium leading-8 tracking-normal text-foreground",
        className,
      )}
    >
      <AnimatePresence initial={animateInitial && !reduce}>
        <motion.span
          key={text}
          className="col-start-1 row-start-1"
          initial={reduce ? false : { opacity: 0, filter: "blur(12px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(12px)" }}
          transition={reduce ? { duration: 0 } : transition}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </h1>
  );
}
