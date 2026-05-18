"use client";

import { useEffect } from "react";

const SNAP_CLASSES = [
  "snap-y",
  "snap-mandatory",
  "overflow-y-scroll",
  "h-svh",
] as const;

export function useScrollSnap(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    const el = document.documentElement;
    SNAP_CLASSES.forEach((c) => el.classList.add(c));
    return () => {
      SNAP_CLASSES.forEach((c) => el.classList.remove(c));
    };
  }, [enabled]);
}
