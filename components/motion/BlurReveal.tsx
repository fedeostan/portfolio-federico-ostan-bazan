"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { transitions } from "@/lib/motion-config";

interface BlurRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function BlurReveal({ children, delay = 0, className }: BlurRevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(12px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ ...transitions.blurReveal, delay }}
    >
      {children}
    </motion.div>
  );
}
