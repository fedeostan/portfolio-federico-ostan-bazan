# Issue #13 — `useChat` Integration in Hero — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the streaming `/api/chat` brain to the hero's `AIChatInput` so a visitor's prompt produces a live answer with reasoning, project cards, and a reset path — all within Figma's design feel.

**Architecture:** A new coordinating parent component (`HeroChat`) owns the hero ↔ chat mode flip plus body-scroll lock. `HeroSequence` stays an idle/intro component; a new `ChatExperience` hosts `useChat` and renders the single in-flight assistant message via small focused sub-components (`StreamingText`, `ReasoningAccordion`, `ToolStatusPill`, `ChatErrorCard`, `NewQuestionButton`, `ProjectCardSkeleton`). A pure reducer (`reduceMessageParts`) consolidates reasoning at the top of the message while preserving source order for text + cards beneath.

**Tech Stack:** Next.js 16 App Router, React 19, `@ai-sdk/react` v6 + `ai@^6`, `motion@^12`, Tailwind v4, shadcn primitives. No new test infra (matches codebase conventions). Verification via `pnpm typecheck`, `pnpm lint`, and a `/test-chat-experience` QA route mirroring the existing `/test-dock` pattern.

**Spec:** `docs/superpowers/specs/2026-05-19-issue-13-usechat-hero-design.md` (commit `27c6c58`).

---

## Pre-flight

Before starting Task 1, confirm:
- Working directory: `/Users/federicoostanbazan/portfolio-federico-ostan-bazan/.claude/worktrees/issue-13-usechat-hero`
- Branch: `worktree-issue-13-usechat-hero` (will be renamed in Task 14)
- `app/api/chat/route.ts` exists (from #12)
- `git status` clean

If any check fails, stop and report.

---

## Task 1: Install `@ai-sdk/react` and verify the build still passes

**Files:**
- Modify: `package.json` (auto via pnpm)
- Modify: `pnpm-lock.yaml` (auto)

- [ ] **Step 1: Install the package**

Run:
```bash
pnpm add @ai-sdk/react
```

Expected: package added; pnpm-lock.yaml updated. The `ai@^6.0.184` peer is already present.

- [ ] **Step 2: Typecheck**

Run:
```bash
pnpm typecheck
```

Expected: no errors. If TypeScript flags a peer mismatch with `ai`, run `pnpm why @ai-sdk/react` to inspect; do not pin a different `ai` version without checking spec compatibility.

- [ ] **Step 3: Lint**

Run:
```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add @ai-sdk/react for #13"
```

---

## Task 2: Pure part reducer (`reduceMessageParts`)

This is the only piece of business logic with branches; isolating it as a pure function makes it auditable without React.

**Files:**
- Create: `lib/ai/reduce-message-parts.ts`

- [ ] **Step 1: Write the file**

Create `lib/ai/reduce-message-parts.ts`:

```ts
import type { UIMessage } from "@ai-sdk/react";

type AnyPart = UIMessage["parts"][number];

export type ToolPartState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error";

export type RenderablePart =
  | { kind: "text"; key: number; text: string }
  | {
      kind: "tool-show_project_card";
      key: number;
      state: ToolPartState;
      output?: unknown;
    };

export type RenderModel = {
  reasoningText: string;
  activeTool: string | null;
  inOrderParts: RenderablePart[];
};

const SILENT_TOOL_TYPES = new Set<string>([
  "tool-search_projects",
  "tool-get_project_detail",
]);

function readState(part: AnyPart): ToolPartState | undefined {
  const candidate = (part as { state?: unknown }).state;
  if (
    candidate === "input-streaming" ||
    candidate === "input-available" ||
    candidate === "output-available" ||
    candidate === "output-error"
  ) {
    return candidate;
  }
  return undefined;
}

export function reduceMessageParts(
  parts: ReadonlyArray<AnyPart>,
): RenderModel {
  let reasoningText = "";
  let activeTool: string | null = null;
  const inOrderParts: RenderablePart[] = [];

  parts.forEach((part, index) => {
    if (part.type === "reasoning" && "text" in part && typeof part.text === "string") {
      reasoningText = reasoningText
        ? `${reasoningText}\n\n${part.text}`
        : part.text;
      return;
    }

    if (part.type === "text" && "text" in part && typeof part.text === "string") {
      inOrderParts.push({ kind: "text", key: index, text: part.text });
      return;
    }

    if (part.type === "tool-show_project_card") {
      const state = readState(part);
      if (!state) return;
      const output = (part as { output?: unknown }).output;
      inOrderParts.push({
        kind: "tool-show_project_card",
        key: index,
        state,
        output,
      });
      return;
    }

    if (SILENT_TOOL_TYPES.has(part.type)) {
      const state = readState(part);
      if (state === "input-streaming" || state === "input-available") {
        activeTool = part.type;
      } else if (
        (state === "output-available" || state === "output-error") &&
        activeTool === part.type
      ) {
        activeTool = null;
      }
    }
  });

  return { reasoningText, activeTool, inOrderParts };
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: no errors. If `@ai-sdk/react` doesn't export `UIMessage`, fall back to `import type { UIMessage } from "ai"` — both packages re-export it.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/ai/reduce-message-parts.ts
git commit -m "feat(chat): pure reducer for message parts (#13)"
```

---

## Task 3: `ProjectCardSkeleton` + shimmer keyframe

The skeleton matches `ProjectCard`'s aspect ratio + rounding (per `components/project/ProjectCard.tsx:31`).

**Files:**
- Create: `components/project/ProjectCardSkeleton.tsx`
- Modify: `app/globals.css` (add `@keyframes shimmer`)

- [ ] **Step 1: Add the shimmer keyframe to globals**

Open `app/globals.css`. Find the existing `@theme inline` block (or whichever block defines tokens). Append at the end of the file:

```css
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .animate-shimmer { animation: none; }
}
```

If a `@keyframes shimmer` already exists, skip this step.

- [ ] **Step 2: Create the skeleton component**

Create `components/project/ProjectCardSkeleton.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";

interface ProjectCardSkeletonProps {
  className?: string;
}

export function ProjectCardSkeleton({ className }: ProjectCardSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading project card"
      className={cn(
        "relative aspect-[34/43] w-full overflow-hidden rounded-4xl bg-card ring-1 ring-border",
        className,
      )}
    >
      <div
        aria-hidden
        className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.06)_50%,transparent_75%)] bg-[length:200%_100%]"
        style={{ animation: "shimmer 1.5s linear infinite" }}
      />
      <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6">
        <div className="h-3 w-1/3 rounded-full bg-muted/60" />
        <div className="h-5 w-2/3 rounded-full bg-muted/60" />
        <div className="h-4 w-full rounded-full bg-muted/50" />
        <div className="h-4 w-4/5 rounded-full bg-muted/50" />
      </div>
    </div>
  );
}
```

(Inline `style={{ animation: ... }}` is a belt-and-suspenders fallback in case Tailwind doesn't auto-generate the `animate-shimmer` utility.)

- [ ] **Step 3: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add components/project/ProjectCardSkeleton.tsx app/globals.css
git commit -m "feat(project): ProjectCardSkeleton with shimmer (#13)"
```

---

## Task 4: `StreamingText` — per-word blur-in with perf bound

**Files:**
- Create: `components/hero/StreamingText.tsx`

- [ ] **Step 1: Create the component**

Create `components/hero/StreamingText.tsx`:

```tsx
"use client";

import {
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { useEffect, useMemo, useRef } from "react";

import { cn } from "@/lib/utils";

const WORD_TRANSITION: Transition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
};

const ACTIVE_WINDOW = 16;

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  className?: string;
}

export function StreamingText({
  text,
  isStreaming,
  className,
}: StreamingTextProps) {
  const reduce = useReducedMotion();
  const prevCountRef = useRef(0);

  const tokens = useMemo(
    () => text.split(/(\s+)/).filter((t) => t.length > 0),
    [text],
  );
  const totalCount = tokens.length;
  const prevCount = prevCountRef.current;

  useEffect(() => {
    prevCountRef.current = totalCount;
  });

  if (reduce) {
    return <p className={cn("whitespace-pre-wrap", className)}>{text}</p>;
  }

  const settledThreshold = Math.max(0, totalCount - ACTIVE_WINDOW);
  const settled = tokens.slice(0, settledThreshold).join("");
  const activeTokens = tokens.slice(settledThreshold);

  return (
    <p className={cn("whitespace-pre-wrap", className)}>
      {settled.length > 0 ? <span>{settled}</span> : null}
      {activeTokens.map((tok, i) => {
        const absoluteIndex = settledThreshold + i;
        if (/^\s+$/.test(tok)) {
          return <span key={`ws-${absoluteIndex}`}>{tok}</span>;
        }
        const isNew = absoluteIndex >= prevCount;
        return (
          <motion.span
            key={`w-${absoluteIndex}`}
            initial={isNew ? { opacity: 0, filter: "blur(8px)" } : false}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={WORD_TRANSITION}
            style={{ display: "inline-block" }}
          >
            {tok}
          </motion.span>
        );
      })}
    </p>
  );
}
```

Why `initial={false}` for existing words: prevents re-animation on every render. Only words past `prevCount` (i.e. genuinely new this render) start blurred.

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/hero/StreamingText.tsx
git commit -m "feat(hero): StreamingText with per-word blur-in (#13)"
```

---

## Task 5: `ReasoningAccordion` — auto-toggle with user-toggle override

**Files:**
- Create: `components/hero/ReasoningAccordion.tsx`

- [ ] **Step 1: Create the component**

Create `components/hero/ReasoningAccordion.tsx`:

```tsx
"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { StreamingText } from "@/components/hero/StreamingText";
import { cn } from "@/lib/utils";

const COLLAPSE_TRANSITION: Transition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1],
};

interface ReasoningAccordionProps {
  text: string;
  isStreaming: boolean;
  className?: string;
}

export function ReasoningAccordion({
  text,
  isStreaming,
  className,
}: ReasoningAccordionProps) {
  const reduce = useReducedMotion();
  const [userToggled, setUserToggled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (userToggled) return;
    if (isStreaming && text.length > 0) {
      setOpen(true);
    } else if (!isStreaming) {
      setOpen(false);
    }
  }, [isStreaming, text, userToggled]);

  if (text.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-muted/30 px-4 py-3",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => {
          setUserToggled(true);
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-muted-foreground transition-colors duration-(--duration-base) ease-(--ease-standard) hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span>How I reasoned</span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-(--duration-base) ease-(--ease-standard)",
            open ? "rotate-180" : "rotate-0",
          )}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            initial={reduce ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
            transition={reduce ? { duration: 0 } : COLLAPSE_TRANSITION}
            className="overflow-hidden"
          >
            <div className="pt-3 text-sm leading-6 text-muted-foreground">
              <StreamingText text={text} isStreaming={isStreaming} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/hero/ReasoningAccordion.tsx
git commit -m "feat(hero): ReasoningAccordion with auto-toggle (#13)"
```

---

## Task 6: `ToolStatusPill` — silent-tool status indicator

**Files:**
- Create: `components/hero/ToolStatusPill.tsx`

- [ ] **Step 1: Create the component**

Create `components/hero/ToolStatusPill.tsx`:

```tsx
"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const TOOL_LABELS: Record<string, string> = {
  "tool-search_projects": "Searching projects…",
  "tool-get_project_detail": "Reading case study…",
};

interface ToolStatusPillProps {
  activeTool: string | null;
  className?: string;
}

export function ToolStatusPill({
  activeTool,
  className,
}: ToolStatusPillProps) {
  const reduce = useReducedMotion();
  const label = activeTool ? (TOOL_LABELS[activeTool] ?? "Working…") : null;

  return (
    <AnimatePresence>
      {label ? (
        <motion.div
          key={label}
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground",
            className,
          )}
        >
          <span
            aria-hidden
            className="size-1.5 animate-pulse rounded-full bg-foreground/50"
          />
          {label}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/hero/ToolStatusPill.tsx
git commit -m "feat(hero): ToolStatusPill for silent tool calls (#13)"
```

---

## Task 7: `ChatErrorCard` — classifier + 3 variants + retry

**Files:**
- Create: `components/hero/ChatErrorCard.tsx`

- [ ] **Step 1: Create the component**

Create `components/hero/ChatErrorCard.tsx`:

```tsx
"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatErrorVariant = "rate-limit" | "network" | "server";

const COPY: Record<ChatErrorVariant, { headline: string; sub: string }> = {
  "rate-limit": {
    headline: "Lots of people are chatting with me right now.",
    sub: "Give it a few seconds and try again.",
  },
  network: {
    headline: "Looks like your connection blinked.",
    sub: "Check your network and retry.",
  },
  server: {
    headline: "Something glitched on my end.",
    sub: "Retry, or hit 'New question' to start fresh.",
  },
};

export function classifyChatError(error: Error): ChatErrorVariant {
  const msg = error.message.toLowerCase();
  if (msg.includes("429") || msg.includes("rate")) return "rate-limit";
  if (msg.includes("fetch") || msg.includes("network")) return "network";
  return "server";
}

interface ChatErrorCardProps {
  error: Error;
  onRetry: () => void;
  className?: string;
}

export function ChatErrorCard({
  error,
  onRetry,
  className,
}: ChatErrorCardProps) {
  const variant = classifyChatError(error);
  const { headline, sub } = COPY[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 rounded-4xl bg-muted/40 p-6 ring-1 ring-border",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="font-medium text-foreground">{headline}</p>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>
      <div>
        <Button onClick={onRetry} variant="default" size="sm">
          <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden />
          Try again
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/hero/ChatErrorCard.tsx
git commit -m "feat(hero): ChatErrorCard with classifier + retry (#13)"
```

---

## Task 8: `NewQuestionButton`

**Files:**
- Create: `components/hero/NewQuestionButton.tsx`

- [ ] **Step 1: Create the component**

Create `components/hero/NewQuestionButton.tsx`:

```tsx
"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface NewQuestionButtonProps {
  onReset: () => void;
  className?: string;
}

export function NewQuestionButton({
  onReset,
  className,
}: NewQuestionButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onReset}
      className={className}
    >
      <Plus className="size-3.5" strokeWidth={2} aria-hidden />
      New question
    </Button>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/hero/NewQuestionButton.tsx
git commit -m "feat(hero): NewQuestionButton (#13)"
```

---

## Task 9: `ChatExperience` — the integration

This is the largest file. It hosts `useChat`, sends `initialPrompt` exactly once, reduces parts via the pure function, and orchestrates all sub-components.

**Files:**
- Create: `components/hero/ChatExperience.tsx`

- [ ] **Step 1: Create the component**

Create `components/hero/ChatExperience.tsx`:

```tsx
"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { useEffect, useMemo, useRef } from "react";

import { ChatErrorCard } from "@/components/hero/ChatErrorCard";
import { NewQuestionButton } from "@/components/hero/NewQuestionButton";
import { ReasoningAccordion } from "@/components/hero/ReasoningAccordion";
import { StreamingText } from "@/components/hero/StreamingText";
import { ToolStatusPill } from "@/components/hero/ToolStatusPill";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectCardSkeleton } from "@/components/project/ProjectCardSkeleton";
import { reduceMessageParts } from "@/lib/ai/reduce-message-parts";
import type { ProjectCardProps } from "@/types/project";

interface ChatExperienceProps {
  initialPrompt: string;
  onReset: () => void;
}

export function ChatExperience({
  initialPrompt,
  onReset,
}: ChatExperienceProps) {
  const reduce = useReducedMotion();

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error, regenerate, stop } = useChat({
    transport,
    onError: (err) => {
      console.error("[chat]", err);
    },
  });

  const sentRef = useRef(false);
  useEffect(() => {
    if (sentRef.current || !initialPrompt) return;
    sentRef.current = true;
    sendMessage({ text: initialPrompt });
  }, [initialPrompt, sendMessage]);

  const isStreaming = status === "streaming" || status === "submitted";

  const userMessage: UIMessage | undefined = messages.find(
    (m) => m.role === "user",
  );
  const assistant: UIMessage | undefined = messages.find(
    (m) => m.role === "assistant",
  );
  const model = useMemo(
    () => (assistant ? reduceMessageParts(assistant.parts) : null),
    [assistant?.parts],
  );

  const userPromptText =
    userMessage?.parts
      .map((p) => (p.type === "text" && "text" in p ? p.text : ""))
      .join("") || initialPrompt;

  const handleReset = () => {
    if (isStreaming) stop();
    onReset();
  };

  const handleRetry = () => {
    void regenerate();
  };

  return (
    <div className="mx-auto flex h-svh w-full max-w-2xl flex-col gap-6 overflow-y-auto px-4 py-8 sm:py-12">
      <header className="flex items-start justify-between gap-4">
        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
          {userPromptText}
        </p>
        <NewQuestionButton onReset={handleReset} />
      </header>

      {model ? (
        <div className="flex flex-col gap-4">
          <ReasoningAccordion
            text={model.reasoningText}
            isStreaming={isStreaming}
          />
          <ToolStatusPill activeTool={model.activeTool} />

          <div className="flex flex-col gap-6">
            {model.inOrderParts.map((part) => {
              if (part.kind === "text") {
                return (
                  <StreamingText
                    key={part.key}
                    text={part.text}
                    isStreaming={isStreaming}
                    className="text-base leading-7 text-foreground"
                  />
                );
              }

              if (part.state === "output-error") return null;

              const isOutput =
                part.state === "output-available" && part.output != null;

              return (
                <AnimatePresence
                  key={part.key}
                  mode="wait"
                  initial={false}
                >
                  {isOutput ? (
                    <motion.div
                      key="card"
                      initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProjectCard
                        {...toProjectCardProps(part.output)}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="skel"
                      initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProjectCardSkeleton />
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Thinking…</p>
      )}

      {error ? (
        <ChatErrorCard error={error} onRetry={handleRetry} />
      ) : null}
    </div>
  );
}

function toProjectCardProps(output: unknown): ProjectCardProps {
  const o = (output ?? {}) as Record<string, unknown>;
  return {
    id: typeof o.id === "string" ? o.id : "",
    slug: typeof o.slug === "string" ? o.slug : "",
    title: typeof o.title === "string" ? o.title : "",
    summary: typeof o.summary === "string" ? o.summary : "",
    category: o.category as ProjectCardProps["category"],
    og_image: typeof o.og_image === "string" ? o.og_image : null,
    tech_stack: Array.isArray(o.tech_stack)
      ? (o.tech_stack as string[])
      : undefined,
    role: typeof o.role === "string" ? o.role : null,
    year: typeof o.year === "number" ? o.year : null,
    highlight: o.highlight as ProjectCardProps["highlight"] | undefined,
  };
}
```

Why this shape:
- `transport` is memoised so re-renders don't create new transport instances.
- `sentRef` guard prevents the strict-mode double-send.
- `model.inOrderParts` is rendered exactly in source order; `tool-show_project_card` parts get the skeleton ↔ card crossfade per the spec; `output-error` parts silently degrade.
- `handleReset` calls `stop()` if a stream is in flight, so aborts a half-finished response cleanly.
- The whole panel is `h-svh` + `overflow-y-auto` so the *inner* container scrolls while the page (body) is locked by `HeroChat` in Task 11.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: clean. If `assistant?.parts` triggers a "possibly undefined" complaint on the `useMemo` dependency array (ESLint), the deps are still correct — silence locally if needed via `// eslint-disable-next-line react-hooks/exhaustive-deps` only for the `useMemo` call, with a comment that we intentionally key on `parts` identity.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add components/hero/ChatExperience.tsx
git commit -m "feat(hero): ChatExperience hosting useChat (#13)"
```

---

## Task 10: `/test-chat-experience` QA route

Mirrors the existing `/test-dock` pattern so each path through `ChatExperience` is exercisable visually before wiring into the page.

**Files:**
- Create: `app/test-chat-experience/page.tsx`

- [ ] **Step 1: Create the route**

Create `app/test-chat-experience/page.tsx`:

```tsx
"use client";

import { useState } from "react";

import { ChatExperience } from "@/components/hero/ChatExperience";

const SUGGESTIONS = [
  "What's a project you're proud of?",
  "Tell me about your AI work",
  "Hi",
];

export default function TestChatExperiencePage() {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [input, setInput] = useState("");

  if (prompt) {
    return (
      <ChatExperience
        initialPrompt={prompt}
        onReset={() => setPrompt(null)}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center gap-6 px-4">
      <h1 className="font-heading text-2xl font-semibold">
        /test-chat-experience
      </h1>
      <p className="text-center text-sm text-muted-foreground">
        QA harness for ChatExperience. Pick a suggestion or type a prompt.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setPrompt(s)}
            className="rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
          >
            {s}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) setPrompt(input.trim());
        }}
        className="flex w-full gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Custom prompt…"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Send
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Start the dev server and visually verify**

Run (in a separate terminal):
```bash
pnpm dev
```

Open `http://localhost:3000/test-chat-experience`.

Verify each:
- Pick "What's a project you're proud of?" → see `Thinking…` → reasoning accordion appears and auto-expands → status pill cycles → skeleton appears → card swaps in → narrative blurs in word-by-word → on completion, accordion auto-collapses → can re-expand by clicking → "New question" returns to the suggestion picker.
- Pick "Hi" → no tools, only reasoning + short text → accordion still auto-toggles.
- Throttle network to "Offline" in DevTools, pick any suggestion → `ChatErrorCard` with `network` copy + Try again.
- Mid-stream, click "New question" → stream aborts cleanly; suggestions re-appear.

If any step misbehaves, *do not commit yet* — re-read the relevant component in Tasks 4–9 and fix before continuing.

- [ ] **Step 3: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add app/test-chat-experience/page.tsx
git commit -m "chore(qa): /test-chat-experience harness route (#13)"
```

---

## Task 11: `HeroChat` — mode flip + scroll lock

**Files:**
- Create: `components/hero/HeroChat.tsx`

- [ ] **Step 1: Create the component**

Create `components/hero/HeroChat.tsx`:

```tsx
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

const ENTER_TRANSITION: Transition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1],
};

type Mode = "idle" | "active";

export function HeroChat() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("idle");
  const [initialPrompt, setInitialPrompt] = useState<string>("");

  useEffect(() => {
    if (mode !== "active") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mode]);

  const enter = (prompt: string) => {
    setInitialPrompt(prompt);
    setMode("active");
  };

  const leave = () => {
    setMode("idle");
    setInitialPrompt("");
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
            onReset={leave}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/hero/HeroChat.tsx
git commit -m "feat(hero): HeroChat coordinating parent with scroll lock (#13)"
```

---

## Task 12: Wire `HeroChat` into `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `HeroSequence` with `HeroChat`**

Current `app/page.tsx` content:

```tsx
import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroSequence } from "@/components/hero/HeroSequence";
import { SectionShell } from "@/components/motion/SectionShell";

export default function Home() {
  return (
    <SectionShell id="hero">
      <HeroBackground />
      <HeroSequence />
    </SectionShell>
  );
}
```

Replace the import and JSX:

```tsx
import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroChat } from "@/components/hero/HeroChat";
import { SectionShell } from "@/components/motion/SectionShell";

export default function Home() {
  return (
    <SectionShell id="hero">
      <HeroBackground />
      <HeroChat />
    </SectionShell>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: clean.

- [ ] **Step 3: Quick smoke on `pnpm dev`**

Open `http://localhost:3000/`. Verify:
- Hero intro plays as before.
- Typing a prompt and pressing Enter transitions into the chat view.
- Body scroll is locked while chat is active.
- "New question" returns to the hero in `ready` state (no full intro replay, because `sessionStorage[hero-played]` is set after the first run).
- Body scroll restored after reset.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(hero): wire HeroChat into root page (#13)"
```

---

## Task 13: Full manual QA pass against the issue checklist

No code changes in this task — verification only.

**Files:** none.

- [ ] **Step 1: Issue QA — Submit a real prompt**

In `pnpm dev` at `http://localhost:3000/`, type `"What's a project you're proud of?"`. Expected: chat view enters; status pill cycles; reasoning accordion auto-opens; at least one `ProjectCard` appears after a skeleton; narrative text blurs in word-by-word; accordion auto-collapses on completion.

- [ ] **Step 2: Issue QA — Project card on project-relevant prompt**

Same prompt as Step 1. Confirm ≥ 1 `ProjectCard` renders. Confirm the card's link points to `/case-studies/<slug>` (per `ProjectCard.tsx:23`).

- [ ] **Step 3: Issue QA — Reasoning accordion expands**

After the response finishes and the accordion auto-collapses, click the summary. Confirm it expands and shows the consolidated reasoning text. Click again — collapses cleanly.

- [ ] **Step 4: Issue QA — Streaming text blurs in smoothly**

Visual inspection during stream. No jitter; no whole-message flash; words appear blurred briefly then sharpen. On a long answer (~200+ words), check that there's no visible perf hitch as words settle.

- [ ] **Step 5: Issue QA — Network error → friendly error**

Submit a prompt. While the response is streaming (or before), open DevTools → Network → set Throttling to "Offline". If a fresh prompt is needed, click "New question," go offline, then submit. Expected: `ChatErrorCard` with `network` variant copy; "Try again" button present. Click Try again with network restored → fresh stream begins.

- [ ] **Step 6: Issue QA — Scroll lock + restoration**

While chat is active, attempt to scroll the page (mousewheel / spacebar / touch). Expected: page does not scroll; only the chat panel's inner container scrolls. Click "New question". Expected: scroll restored, body `overflow` cleared.

- [ ] **Step 7: Issue QA — Mobile 360px**

Open Chrome DevTools, set device to 360×640. Refresh. Submit a project-relevant prompt. Expected: cards stack vertically with no horizontal overflow; reasoning accordion remains readable; "New question" button remains tappable in the header.

- [ ] **Step 8: Strict-mode single-send verification**

In dev (React strict mode is on by default in Next 16), open DevTools Network panel. Submit a prompt. Confirm exactly **one** POST to `/api/chat`. (If two, the `sentRef` guard in `ChatExperience` is broken — fix Task 9.)

- [ ] **Step 9: Rapid reset → new question**

Submit a prompt; while streaming, click "New question"; immediately submit a different prompt. Confirm: no overlapping streams; the second prompt's response is the one displayed; no console errors about an aborted fetch (a clean abort message is fine; an unhandled rejection is not).

- [ ] **Step 10: Record results**

If all steps pass, proceed to Task 14. If any step fails:
1. Identify the responsible component (Tasks 2–11).
2. Fix in that component's file only.
3. Re-run `pnpm typecheck && pnpm lint`.
4. Re-run the failing QA step.
5. Commit the fix on its own (`fix(hero): <description> (#13)`).
6. Re-verify all subsequent QA steps that could be affected.

---

## Task 14: Final cleanup + PR prep

**Files:** none (git/branch management only).

- [ ] **Step 1: Rename branch**

```bash
git branch -m worktree-issue-13-usechat-hero feature/issue-13-usechat-hero
git status
```

Expected: `On branch feature/issue-13-usechat-hero`.

- [ ] **Step 2: Final typecheck + lint + build**

```bash
pnpm typecheck && pnpm lint && pnpm build
```

Expected: all three pass. The `pnpm build` is the last guardrail — catches Server Component / Client Component boundary issues that typecheck might miss.

- [ ] **Step 3: Inspect the commit log**

```bash
git log --oneline origin/main..HEAD
```

Expected: a clean linear sequence of feature commits — `chore(deps)` → reducer → skeleton → StreamingText → ReasoningAccordion → ToolStatusPill → ChatErrorCard → NewQuestionButton → ChatExperience → QA route → HeroChat → page wiring → spec/plan docs. Any merge commits indicate the rebase from earlier in the worktree session — those are fine.

- [ ] **Step 4: Push and open PR**

```bash
git push -u origin feature/issue-13-usechat-hero
gh pr create --title "feat(hero): useChat integration (#13)" --body "$(cat <<'EOF'
## Summary
- Wires the `/api/chat` streaming brain (from #12) to the hero `AIChatInput` (from #9), bringing the portfolio's hero to life.
- New coordinating parent `HeroChat` owns the hero ↔ chat mode flip with body-scroll lock.
- New `ChatExperience` hosts `useChat`, consolidates reasoning at the top of the assistant message, renders silent-tool status pill, renders project cards via skeleton → real card crossfade, and surfaces an inline error card with retry on failure.
- New focused sub-components: `StreamingText` (per-word blur-in with perf-bounded active window), `ReasoningAccordion` (auto-toggle with user-override), `ToolStatusPill`, `ChatErrorCard` (3-variant classifier), `NewQuestionButton`, `ProjectCardSkeleton`.
- `/test-chat-experience` QA route added (matches the existing `/test-dock` pattern).

## Design + plan
- Spec: `docs/superpowers/specs/2026-05-19-issue-13-usechat-hero-design.md`
- Plan: `docs/superpowers/plans/2026-05-19-issue-13-usechat-hero.md`

## Test plan
- [ ] Submit "What's a project you're proud of?" — stream, cards, narrative
- [ ] Verify reasoning accordion auto-opens during stream, auto-collapses on done, manual toggle wins after
- [ ] Toggle DevTools Offline → confirm `ChatErrorCard` `network` variant + Try again
- [ ] Lock scroll while chat is active; "New question" restores
- [ ] 360px viewport: cards stack, no overflow
- [ ] DevTools Network: confirm exactly one POST to `/api/chat` per prompt (strict-mode guard)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Confirm PR opened**

The previous step prints the PR URL. Verify it's reachable via `gh pr view --web`. If the issue's project board has a status field, move #13 to "In review" / equivalent column.

---

## Spec-coverage map (for self-check during implementation)

| Spec section / requirement | Covered by Task(s) |
|---|---|
| §2 Architecture — HeroChat owns mode + scroll lock | 11 |
| §2 Architecture — cross-fade with `AnimatePresence mode="wait"` | 11 |
| §3 Components — all 8 new files | 2, 3, 4, 5, 6, 7, 8, 9, 11 |
| §3 Components — `app/page.tsx` swap | 12 |
| §3 Components — `@ai-sdk/react` dep | 1 |
| §4 Data flow — reduceMessageParts pure function | 2 |
| §4 Data flow — initial-prompt ref guard | 9 |
| §4 Data flow — scroll lock contract | 11 |
| §4 Data flow — streaming text mechanics + perf bound | 4 |
| §5 Error handling — classifier + 3 variants | 7 |
| §5 Error handling — retry via `regenerate()` | 9 |
| §5 Error handling — partial output preserved | 9 (cards/text already rendered remain; ErrorCard renders below) |
| §5 Error handling — `stop()` on reset mid-stream | 9 |
| §6 Motion — wordBlurReveal 250ms | 4 |
| §6 Motion — accordion auto-toggle with user override | 5 |
| §6 Motion — skeleton → card crossfade | 9 |
| §6 Motion — reduced-motion paths | 4, 5, 6, 7, 9, 11 |
| §7 Testing — manual QA against issue checklist | 13 |
| §7 Testing — /test-chat-experience harness | 10 |

---

## Notes for the implementing engineer

- The codebase has no automated tests; verification is `pnpm typecheck` + `pnpm lint` + manual QA. Do not introduce a test framework for this issue.
- `app/api/chat/route.ts` is the contract — do not modify it. If you discover a contract gap, raise it as a separate issue rather than coupling #13 to a route change.
- The motion package is `motion` (Motion One), not `framer-motion`. All `import { motion } from "motion/react"` paths in this plan are correct for the installed version.
- Always commit per task. The plan is structured so each commit corresponds to one isolated unit; if a reviewer wants to bisect, they get clean checkpoints.
- The branch is currently `worktree-issue-13-usechat-hero` because the worktree was created before #12 merged; the rename to `feature/issue-13-usechat-hero` happens in Task 14 Step 1, just before push.
