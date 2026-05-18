"use client";

import { BlurReveal } from "@/components/motion/BlurReveal";
import {
  FadeStagger,
  FadeStaggerItem,
} from "@/components/motion/FadeStagger";
import { SectionShell } from "@/components/motion/SectionShell";
import { SlideUp } from "@/components/motion/SlideUp";
import { useScrollSnap } from "@/hooks/use-scroll-snap";

export default function TestMotionPage() {
  useScrollSnap(true);

  return (
    <main>
      <SectionShell className="bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <BlurReveal>
            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
              BlurReveal
            </h1>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className="mt-4 text-neutral-500">
              Opacity + filter blur, 600ms expo-out.
            </p>
          </BlurReveal>
        </div>
      </SectionShell>

      <SectionShell className="bg-neutral-100 dark:bg-neutral-900">
        <div className="text-center">
          <SlideUp>
            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
              SlideUp
            </h1>
          </SlideUp>
          <SlideUp delay={0.15}>
            <p className="mt-4 text-neutral-500">
              y: 40 → 0, spring (stiffness 300, damping 25).
            </p>
          </SlideUp>
        </div>
      </SectionShell>

      <SectionShell className="bg-neutral-50 dark:bg-neutral-950">
        <FadeStagger
          className="flex flex-col items-center gap-3 text-center"
          staggerDelay={0.12}
        >
          <FadeStaggerItem>
            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
              FadeStagger
            </h1>
          </FadeStaggerItem>
          <FadeStaggerItem>
            <p className="text-neutral-500">Item one</p>
          </FadeStaggerItem>
          <FadeStaggerItem>
            <p className="text-neutral-500">Item two</p>
          </FadeStaggerItem>
          <FadeStaggerItem>
            <p className="text-neutral-500">Item three</p>
          </FadeStaggerItem>
          <FadeStaggerItem>
            <p className="text-neutral-500">Item four</p>
          </FadeStaggerItem>
        </FadeStagger>
      </SectionShell>

      <SectionShell className="bg-neutral-100 dark:bg-neutral-900">
        <div className="text-center">
          <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
            SectionShell
          </h1>
          <p className="mt-4 text-neutral-500">
            h-svh · snap-start · grid place-items-center
          </p>
        </div>
      </SectionShell>
    </main>
  );
}
