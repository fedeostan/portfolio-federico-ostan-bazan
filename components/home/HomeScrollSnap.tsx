"use client";

import type { ReactNode } from "react";

import { useScrollSnap } from "@/hooks/use-scroll-snap";

export function HomeScrollSnap({ children }: { children: ReactNode }) {
  useScrollSnap(true);
  return <>{children}</>;
}
