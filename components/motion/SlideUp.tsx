"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { transitions } from "@/lib/motion-config";

interface SlideUpProps {
  children: ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
}

export function SlideUp({
  children,
  delay = 0,
  distance = 40,
  className,
}: SlideUpProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ y: distance, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...transitions.slideUp, delay }}
    >
      {children}
    </motion.div>
  );
}
