"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";

import { ContactBox } from "@/components/contact/ContactBox";
import { ContactEmailForm } from "@/components/contact/ContactEmailForm";
import { transitions } from "@/lib/motion-config";
import { cn } from "@/lib/utils";

// State machine — see issue #22.
// idle → imageSliding → boxRevealed → formActive
//                          ↑ ↓ HOVER
type State =
  | { kind: "idle" }
  | { kind: "imageSliding" }
  | { kind: "boxRevealed"; hovered: boolean }
  | { kind: "formActive" };

type Action =
  | { type: "LETS_TALK_CLICKED" }
  | { type: "SLIDE_DONE" }
  | { type: "HOVER"; hovered: boolean }
  | { type: "EMAIL_OPENED" }
  | { type: "FORM_RESET" }
  | { type: "RESET_TO_IDLE" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LETS_TALK_CLICKED":
      return state.kind === "idle" ? { kind: "imageSliding" } : state;
    case "SLIDE_DONE":
      return state.kind === "imageSliding"
        ? { kind: "boxRevealed", hovered: false }
        : state;
    case "HOVER":
      return state.kind === "boxRevealed"
        ? { kind: "boxRevealed", hovered: action.hovered }
        : state;
    case "EMAIL_OPENED":
      return state.kind === "boxRevealed" ? { kind: "formActive" } : state;
    case "FORM_RESET":
      return state.kind === "formActive"
        ? { kind: "boxRevealed", hovered: false }
        : state;
    case "RESET_TO_IDLE":
      return { kind: "idle" };
  }
}

// Keep this aligned with `transitions.pageSection.duration` (in seconds).
const SLIDE_MS = (transitions.pageSection.duration ?? 0.8) * 1000;

interface LetsTalkAnimationProps {
  portrait: ReactNode;
  idleText: ReactNode;
}

export function LetsTalkAnimation({
  portrait,
  idleText,
}: LetsTalkAnimationProps) {
  const reduce = useReducedMotion();
  const [state, dispatch] = useReducer(reducer, { kind: "idle" });
  const slideTimer = useRef<number | null>(null);

  const transition: Transition = reduce
    ? { duration: 0 }
    : transitions.pageSection;

  // After LETS_TALK_CLICKED, fire SLIDE_DONE once the slide should be done.
  // In reduced-motion, fire immediately.
  useEffect(() => {
    if (state.kind !== "imageSliding") return;
    const delay = reduce ? 0 : SLIDE_MS;
    slideTimer.current = window.setTimeout(() => {
      dispatch({ type: "SLIDE_DONE" });
    }, delay);
    return () => {
      if (slideTimer.current) window.clearTimeout(slideTimer.current);
    };
  }, [state.kind, reduce]);

  const onLetsTalk = useCallback(() => {
    dispatch({ type: "LETS_TALK_CLICKED" });
  }, []);
  const onClose = useCallback(() => {
    dispatch({ type: "RESET_TO_IDLE" });
  }, []);
  const onEmailClick = useCallback(() => {
    dispatch({ type: "EMAIL_OPENED" });
  }, []);
  const onFormBack = useCallback(() => {
    dispatch({ type: "FORM_RESET" });
  }, []);
  const onHoverChange = useCallback((hovered: boolean) => {
    dispatch({ type: "HOVER", hovered });
  }, []);

  const isIdle = state.kind === "idle";
  // Block interactions while the slide is in flight, but keep nodes mounted
  // so layoutId can animate uninterrupted.
  const interactionLocked = state.kind === "imageSliding";

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-[126px]",
        interactionLocked && "pointer-events-none",
      )}
      aria-busy={interactionLocked}
    >
      {/* Left slot — text in idle, portrait once revealed */}
      <AnimatePresence mode="popLayout" initial={false}>
        {isIdle ? (
          <motion.div
            key="text"
            className="w-[420px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: reduce ? 0 : -16 }}
            transition={transition}
          >
            {renderIdleText(idleText, onLetsTalk)}
          </motion.div>
        ) : (
          <motion.div
            key="portrait-left"
            layoutId="portrait"
            transition={transition}
          >
            {portrait}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right slot — portrait in idle, contact card otherwise */}
      <AnimatePresence mode="popLayout" initial={false}>
        {isIdle ? (
          <motion.div
            key="portrait-right"
            layoutId="portrait"
            transition={transition}
          >
            {portrait}
          </motion.div>
        ) : state.kind === "formActive" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: reduce ? 0 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : 16 }}
            transition={transition}
          >
            <ContactEmailForm onBack={onFormBack} onClose={onClose} />
          </motion.div>
        ) : (
          <motion.div
            key="box"
            initial={{ opacity: 0, x: reduce ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : 16 }}
            transition={transition}
          >
            <ContactBox
              onEmailClick={onEmailClick}
              onClose={onClose}
              hovered={state.kind === "boxRevealed" ? state.hovered : false}
              onHoverChange={onHoverChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Renders the idle text block and injects the click handler onto whatever
// element inside the slot has [data-lets-talk]. Lets the section component
// own the copy while LetsTalkAnimation owns the orchestration.
function renderIdleText(node: ReactNode, onClick: () => void): ReactNode {
  return (
    <div
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-lets-talk]")) {
          e.preventDefault();
          onClick();
        }
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        const target = e.target as HTMLElement;
        if (target.closest("[data-lets-talk]")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {node}
    </div>
  );
}
