"use client";

import type { ReactNode } from "react";

import { BlurReveal } from "@/components/motion/BlurReveal";
import { cn } from "@/lib/utils";

interface HeroTitleProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function HeroTitle({ children, className, delay = 0.2 }: HeroTitleProps) {
  return (
    <BlurReveal delay={delay}>
      <h1
        className={cn(
          "text-balance text-center font-sans text-2xl font-medium leading-8 tracking-normal text-foreground",
          className,
        )}
      >
        {children}
      </h1>
    </BlurReveal>
  );
}
