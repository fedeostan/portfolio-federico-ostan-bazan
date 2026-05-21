"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import { ChatErrorCard } from "@/components/hero/ChatErrorCard";
import { NewQuestionButton } from "@/components/hero/NewQuestionButton";
import { ReasoningAccordion } from "@/components/hero/ReasoningAccordion";
import { StreamingText } from "@/components/hero/StreamingText";
import { ToolStatusPill } from "@/components/hero/ToolStatusPill";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectCardSkeleton } from "@/components/project/ProjectCardSkeleton";
import { reduceMessageParts } from "@/lib/ai/reduce-message-parts";
import type { JobBrief } from "@/lib/ingest/job-brief";
import type { ProjectCardProps } from "@/types/project";

interface ChatExperienceProps {
  initialPrompt: string;
  initialBrief?: JobBrief | null;
  onReset: () => void;
}

export function ChatExperience({
  initialPrompt,
  initialBrief = null,
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
      if (err.message.includes("429") || /rate.?limit/i.test(err.message)) {
        toast("Slow down — please wait a minute.", {
          description: "You're sending messages faster than I can keep up.",
        });
      }
    },
  });

  const sentRef = useRef(false);
  useEffect(() => {
    if (sentRef.current || !initialPrompt) return;
    sentRef.current = true;
    sendMessage(
      { text: initialPrompt },
      initialBrief ? { body: { job_brief: initialBrief } } : undefined,
    );
  }, [initialPrompt, initialBrief, sendMessage]);

  const isStreaming = status === "streaming" || status === "submitted";

  const userMessage: UIMessage | undefined = messages.find(
    (m) => m.role === "user",
  );
  const assistant: UIMessage | undefined = messages.find(
    (m) => m.role === "assistant",
  );
  const model = useMemo(
    () => (assistant ? reduceMessageParts(assistant.parts) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: depend on parts identity
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
                        variant="compact"
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
                      <ProjectCardSkeleton variant="compact" />
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
