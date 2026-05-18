import type { Transition } from "motion/react";

export const transitions = {
  blurReveal: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  slideUp: { type: "spring", stiffness: 300, damping: 25 },
  pageSection: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
} satisfies Record<string, Transition>;

export type TransitionPreset = keyof typeof transitions;
