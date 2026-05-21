"use client";

import { useCallback, useReducer, type ReactNode } from "react";
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

// Mobile-only contact orchestration. The desktop sibling (LetsTalkAnimation)
// runs a horizontal slide-reveal that physically needs two side-by-side
// slots, which doesn't fit a phone viewport. Here we stack vertically and
// skip the slide — portrait stays put, the lower slot swaps content.
type State =
  | { kind: "idle" }
  | { kind: "boxRevealed"; hovered: boolean }
  | { kind: "formActive" };

type Action =
  | { type: "LETS_TALK_CLICKED" }
  | { type: "EMAIL_OPENED" }
  | { type: "FORM_RESET" }
  | { type: "RESET_TO_IDLE" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LETS_TALK_CLICKED":
      return state.kind === "idle"
        ? { kind: "boxRevealed", hovered: false }
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

interface LetsTalkMobileProps {
  portrait: ReactNode;
  idleText: ReactNode;
  className?: string;
}

export function LetsTalkMobile({
  portrait,
  idleText,
  className,
}: LetsTalkMobileProps) {
  const reduce = useReducedMotion();
  const [state, dispatch] = useReducer(reducer, { kind: "idle" });

  const transition: Transition = reduce
    ? { duration: 0 }
    : transitions.pageSection;

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

  const isIdle = state.kind === "idle";

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-10",
        className,
      )}
    >
      <div className="w-full max-w-[320px]">{portrait}</div>

      <div className="flex w-full max-w-[420px] justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {isIdle ? (
            <motion.div
              key="text"
              className="w-full"
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -8 }}
              transition={transition}
            >
              {renderIdleText(idleText, onLetsTalk)}
            </motion.div>
          ) : state.kind === "formActive" ? (
            <motion.div
              key="form"
              className="flex w-full justify-center"
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -8 }}
              transition={transition}
            >
              <ContactEmailForm onBack={onFormBack} onClose={onClose} />
            </motion.div>
          ) : (
            <motion.div
              key="box"
              className="flex w-full justify-center"
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -8 }}
              transition={transition}
            >
              <ContactBox
                onEmailClick={onEmailClick}
                onClose={onClose}
                hovered={false}
                onHoverChange={() => {}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Mirror of LetsTalkAnimation.renderIdleText — keep the prop contract
// identical so SectionContact can hand the same idleText to either variant.
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
