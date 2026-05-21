"use client";

import { useEffect } from "react";

// Full-page scroll snap is a desktop affordance — on phones, sections are
// taller than the viewport (carousel + dots + section header don't fit in
// 100svh) so mandatory snap clipped the dots below the fold. Only attach
// snap classes when md: (768px) or larger.
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
    const mql = window.matchMedia("(min-width: 768px)");

    const apply = () => {
      if (mql.matches) {
        SNAP_CLASSES.forEach((c) => el.classList.add(c));
      } else {
        SNAP_CLASSES.forEach((c) => el.classList.remove(c));
      }
    };

    apply();
    mql.addEventListener("change", apply);
    return () => {
      mql.removeEventListener("change", apply);
      SNAP_CLASSES.forEach((c) => el.classList.remove(c));
    };
  }, [enabled]);
}
