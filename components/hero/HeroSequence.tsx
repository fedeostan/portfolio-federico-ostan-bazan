"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { ChatInputWrapper } from "@/components/hero/ChatInputWrapper";
import { HeroTitle } from "@/components/hero/HeroTitle";
import type { JobBrief } from "@/lib/ingest/job-brief";

type HeroStage =
  | "mount"
  | "title-revealed"
  | "input-fading-in"
  | "title-changing"
  | "ready";

const STORAGE_KEY = "hero-played";

const TITLE_INITIAL = "I’m Federico, welcome to my portfolio!";
const TITLE_FINAL = "Just type, or speak…";

const TIMELINE: ReadonlyArray<{ stage: HeroStage; at: number }> = [
  { stage: "title-revealed", at: 200 },
  { stage: "input-fading-in", at: 1200 },
  { stage: "title-changing", at: 2200 },
  { stage: "ready", at: 3100 },
];

const TITLE_TRANSITION = {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1] as const,
};

const INPUT_TRANSITION = {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1] as const,
};

const subscribeNoop = () => () => {};

const readSessionFlag = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const readSessionFlagServer = () => false;

interface HeroSequenceProps {
  onSend?: (value: string, brief?: JobBrief | null) => void;
}

export function HeroSequence({ onSend }: HeroSequenceProps) {
  const reduce = useReducedMotion();
  const sessionSkip = useSyncExternalStore(
    subscribeNoop,
    readSessionFlag,
    readSessionFlagServer,
  );
  const skipIntro = sessionSkip || reduce === true;

  const [timelineStage, setTimelineStage] = useState<HeroStage>("mount");

  useEffect(() => {
    if (skipIntro) return;
    const ids = TIMELINE.map(({ stage, at }) =>
      window.setTimeout(() => setTimelineStage(stage), at),
    );
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [skipIntro]);

  const stage: HeroStage = skipIntro ? "ready" : timelineStage;

  useEffect(() => {
    if (stage !== "ready") return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // sessionStorage may be unavailable in privacy modes.
    }
  }, [stage]);

  const showFinalTitle = stage === "title-changing" || stage === "ready";
  const showTitle = stage !== "mount";
  const showInput =
    stage === "input-fading-in" ||
    stage === "title-changing" ||
    stage === "ready";

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-12 px-4">
      <div className="min-h-8 w-full">
        {showTitle ? (
          <HeroTitle
            text={showFinalTitle ? TITLE_FINAL : TITLE_INITIAL}
            animateInitial={!skipIntro}
            transition={TITLE_TRANSITION}
          />
        ) : null}
      </div>
      <motion.div
        aria-hidden={!showInput}
        initial={false}
        animate={
          showInput
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : {
                opacity: 0,
                y: reduce ? 0 : 16,
                filter: reduce ? "blur(0px)" : "blur(12px)",
              }
        }
        transition={reduce ? { duration: 0 } : INPUT_TRANSITION}
        style={{ pointerEvents: showInput ? "auto" : "none" }}
        className="w-full"
      >
        <ChatInputWrapper onSend={onSend ?? noop} />
      </motion.div>
    </div>
  );
}

function noop() {
  /* placeholder until #25/#26 wire the send pipeline */
}
