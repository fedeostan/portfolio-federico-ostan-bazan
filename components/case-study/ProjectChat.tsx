"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare, Send, Square } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { toast } from "sonner";

import {
  ChatErrorCard,
} from "@/components/hero/ChatErrorCard";
import { ReasoningAccordion } from "@/components/hero/ReasoningAccordion";
import { StreamingText } from "@/components/hero/StreamingText";
import { ToolStatusPill } from "@/components/hero/ToolStatusPill";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectCardSkeleton } from "@/components/project/ProjectCardSkeleton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { reduceMessageParts } from "@/lib/ai/reduce-message-parts";
import type { ProjectCardProps } from "@/types/project";

interface ProjectChatProps {
  projectId: string;
  projectTitle: string;
}

export function ProjectChat({ projectId, projectTitle }: ProjectChatProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { project_id: projectId, project_title: projectTitle },
      }),
    [projectId, projectTitle],
  );

  const { messages, sendMessage, status, error, regenerate, stop } = useChat({
    transport,
    onError: (err) => {
      console.error("[project-chat]", err);
      toast.error("Couldn't reach the chat — try again in a moment.");
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const body = (
    <ChatBody
      projectTitle={projectTitle}
      messages={messages}
      isStreaming={isStreaming}
      error={error}
      onRetry={() => {
        void regenerate();
      }}
      onStop={stop}
      input={input}
      onInputChange={setInput}
      onSend={handleSend}
      onKeyDown={handleKeyDown}
    />
  );

  return (
    <>
      <aside
        aria-label={`Ask about ${projectTitle}`}
        className="pointer-events-none fixed top-24 right-8 z-40 hidden h-[calc(100vh-8rem)] w-96 lg:block"
      >
        <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
          {body}
        </div>
      </aside>

      <div className="lg:hidden">
        <Button
          type="button"
          size="lg"
          onClick={() => setSheetOpen(true)}
          className="fixed right-4 bottom-4 z-40 gap-2 rounded-full shadow-lg"
          aria-label={`Ask about ${projectTitle}`}
        >
          <MessageSquare className="size-4" />
          Ask about this
        </Button>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            side="bottom"
            className="flex h-[85vh] flex-col rounded-t-2xl p-0"
          >
            <SheetTitle className="sr-only">
              Ask about {projectTitle}
            </SheetTitle>
            {body}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

interface ChatBodyProps {
  projectTitle: string;
  messages: UIMessage[];
  isStreaming: boolean;
  error: Error | undefined;
  onRetry: () => void;
  onStop: () => void;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLTextAreaElement>) => void;
}

function ChatBody({
  projectTitle,
  messages,
  isStreaming,
  error,
  onRetry,
  onStop,
  input,
  onInputChange,
  onSend,
  onKeyDown,
}: ChatBodyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  const isEmpty = messages.length === 0;

  return (
    <>
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <MessageSquare className="size-4 text-muted-foreground" />
        <div className="flex min-w-0 flex-col">
          <h3 className="text-sm font-medium">Ask about this project</h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {projectTitle}
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-5 overflow-y-auto px-4 py-4"
      >
        {isEmpty ? (
          <EmptyState projectTitle={projectTitle} />
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={isStreaming}
            />
          ))
        )}

        {error ? (
          <ChatErrorCard error={error} onRetry={onRetry} />
        ) : null}
      </div>

      <footer className="border-t border-border p-3">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Ask about ${projectTitle}…`}
            rows={1}
            disabled={isStreaming}
            className="min-h-12 resize-none pr-12 text-sm"
          />
          <Button
            type="button"
            size="icon-sm"
            variant={isStreaming ? "secondary" : "default"}
            onClick={isStreaming ? onStop : onSend}
            disabled={!isStreaming && input.trim().length === 0}
            className="absolute right-2 bottom-2"
            aria-label={isStreaming ? "Stop generating" : "Send message"}
          >
            {isStreaming ? (
              <Square className="size-3 fill-current" />
            ) : (
              <Send className="size-3.5" />
            )}
          </Button>
        </div>
      </footer>
    </>
  );
}

function EmptyState({ projectTitle }: { projectTitle: string }) {
  return (
    <div className="flex h-full flex-col items-start justify-end gap-2 text-left">
      <p className="text-sm text-foreground">
        Ask Federico&apos;s expert about <strong>{projectTitle}</strong>.
      </p>
      <ul className="space-y-1 text-xs text-muted-foreground">
        <li>“What role did Federico play?”</li>
        <li>“What was the outcome?”</li>
        <li>“Which decisions shaped the design?”</li>
      </ul>
    </div>
  );
}

interface MessageBubbleProps {
  message: UIMessage;
  isStreaming: boolean;
}

function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const reduce = useReducedMotion();

  if (message.role === "user") {
    const text = message.parts
      .map((part) => (part.type === "text" && "text" in part ? part.text : ""))
      .join("");
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-muted px-3 py-2 text-sm">
          {text}
        </div>
      </div>
    );
  }

  // Recomputing per render is fine here: parts arrays are small and the reducer is cheap.
  const model = reduceMessageParts(message.parts);

  return (
    <div className="flex flex-col gap-3">
      <ReasoningAccordion
        text={model.reasoningText}
        isStreaming={isStreaming}
      />
      <ToolStatusPill activeTool={model.activeTool} />

      <div className="flex flex-col gap-4">
        {model.inOrderParts.map((part) => {
          if (part.kind === "text") {
            return (
              <StreamingText
                key={part.key}
                text={part.text}
                isStreaming={isStreaming}
                className="text-sm leading-6 text-foreground"
              />
            );
          }

          if (part.state === "output-error") return null;

          const isOutput =
            part.state === "output-available" && part.output != null;

          return (
            <AnimatePresence key={part.key} mode="wait" initial={false}>
              {isOutput ? (
                <motion.div
                  key="card"
                  initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProjectCard {...toProjectCardProps(part.output)} />
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
