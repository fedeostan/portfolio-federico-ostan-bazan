"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { useEffect, useState } from "react";

import { ChatExperience } from "@/components/hero/ChatExperience";
import { HeroSequence } from "@/components/hero/HeroSequence";
import type { JobBrief } from "@/lib/ingest/job-brief";

const ENTER_TRANSITION: Transition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1],
};

type Mode = "idle" | "active";

export function HeroChat() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("idle");
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [initialBrief, setInitialBrief] = useState<JobBrief | null>(null);

  useEffect(() => {
    if (mode !== "active") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mode]);

  const enter = (prompt: string, brief?: JobBrief | null) => {
    setInitialPrompt(prompt);
    setInitialBrief(brief ?? null);
    setMode("active");
  };

  const leave = () => {
    setMode("idle");
    setInitialPrompt("");
    setInitialBrief(null);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {mode === "idle" ? (
        <motion.div
          key="hero"
          initial={false}
          animate={
            reduce
              ? { opacity: 1 }
              : { opacity: 1, filter: "blur(0px)" }
          }
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, filter: "blur(8px)" }
          }
          transition={reduce ? { duration: 0 } : ENTER_TRANSITION}
          className="grid w-full place-items-center"
        >
          <HeroSequence onSend={enter} />
        </motion.div>
      ) : (
        <motion.div
          key="chat"
          initial={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, filter: "blur(12px)" }
          }
          animate={
            reduce
              ? { opacity: 1 }
              : { opacity: 1, filter: "blur(0px)" }
          }
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, filter: "blur(8px)" }
          }
          transition={reduce ? { duration: 0 } : ENTER_TRANSITION}
          className="w-full"
        >
          <ChatExperience
            initialPrompt={initialPrompt}
            initialBrief={initialBrief}
            onReset={leave}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
