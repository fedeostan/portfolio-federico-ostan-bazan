"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Link from "next/link";
import {
  ChevronDown,
  ExternalLink,
  MessageCircle,
  Minus,
  Send,
  Square,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { ChatErrorCard } from "@/components/hero/ChatErrorCard";
import { ReasoningAccordion } from "@/components/hero/ReasoningAccordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type DesktopState = "expanded" | "minimized" | "closed";

interface ProjectChatProps {
  projectId: string;
  projectTitle: string;
}

export function ProjectChat({ projectId, projectTitle }: ProjectChatProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [desktopState, setDesktopState] = useState<DesktopState>("expanded");
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
      <DesktopRail
        state={desktopState}
        projectTitle={projectTitle}
        onMinimize={() => setDesktopState("minimized")}
        onClose={() => setDesktopState("closed")}
        onExpand={() => setDesktopState("expanded")}
      >
        {body}
      </DesktopRail>

      <MobileLauncher
        projectTitle={projectTitle}
        onOpen={() => setSheetOpen(true)}
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex h-[85vh] flex-col rounded-t-2xl p-0 lg:hidden"
        >
          <SheetTitle className="sr-only">Ask about {projectTitle}</SheetTitle>
          <ChatHeader
            projectTitle={projectTitle}
            onClose={() => setSheetOpen(false)}
          />
          <ChatBodyContent
            messages={messages}
            isStreaming={isStreaming}
            error={error}
            onRetry={() => {
              void regenerate();
            }}
            projectTitle={projectTitle}
          />
          <ChatFooter
            input={input}
            onInputChange={setInput}
            onKeyDown={handleKeyDown}
            onSend={handleSend}
            onStop={stop}
            isStreaming={isStreaming}
            projectTitle={projectTitle}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── Desktop rail container ────────────────────────────────────────────────

interface DesktopRailProps {
  state: DesktopState;
  projectTitle: string;
  onMinimize: () => void;
  onClose: () => void;
  onExpand: () => void;
  children: React.ReactNode;
}

function DesktopRail({
  state,
  projectTitle,
  onMinimize,
  onClose,
  onExpand,
  children,
}: DesktopRailProps) {
  if (state === "closed") {
    return (
      <button
        type="button"
        onClick={onExpand}
        aria-label={`Open chat about ${projectTitle}`}
        className="fixed top-24 right-8 z-40 hidden size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 lg:flex"
      >
        <MessageCircle className="size-5" />
      </button>
    );
  }

  if (state === "minimized") {
    return (
      <aside
        aria-label={`Chat about ${projectTitle} — minimized`}
        className="pointer-events-none fixed top-24 right-8 z-40 hidden w-96 lg:block"
      >
        <div className="pointer-events-auto overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
          <MinimizedHeader
            projectTitle={projectTitle}
            onExpand={onExpand}
            onClose={onClose}
          />
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label={`Ask about ${projectTitle}`}
      className="pointer-events-none fixed top-24 right-8 z-40 hidden h-[calc(100vh-8rem)] w-96 lg:block"
    >
      <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
        <ChatHeader
          projectTitle={projectTitle}
          onMinimize={onMinimize}
          onClose={onClose}
        />
        {children}
      </div>
    </aside>
  );
}

// ─── Mobile launcher (round chat icon, raised above bottom dock) ──────────

function MobileLauncher({
  projectTitle,
  onOpen,
}: {
  projectTitle: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Ask about ${projectTitle}`}
      className="fixed right-4 bottom-24 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 lg:hidden"
    >
      <MessageCircle className="size-6" />
    </button>
  );
}

// ─── Shared header for expanded panel / sheet ─────────────────────────────

interface ChatHeaderProps {
  projectTitle: string;
  onClose: () => void;
  onMinimize?: () => void;
}

function ChatHeader({ projectTitle, onClose, onMinimize }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <MessageCircle className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-col">
          <h3 className="text-sm font-medium leading-tight">
            Ask about this project
          </h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {projectTitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {onMinimize ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onMinimize}
            aria-label="Minimize chat"
          >
            <Minus className="size-3.5" />
          </Button>
        ) : null}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </header>
  );
}

function MinimizedHeader({
  projectTitle,
  onExpand,
  onClose,
}: {
  projectTitle: string;
  onExpand: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3">
      <button
        type="button"
        onClick={onExpand}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
        aria-label="Expand chat"
      >
        <MessageCircle className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium leading-tight">
            Ask about this project
          </span>
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {projectTitle}
          </span>
        </div>
      </button>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onExpand}
          aria-label="Expand chat"
        >
          <ChevronDown className="size-3.5 rotate-180" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Body (scroll area) and footer (input) ────────────────────────────────

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

function ChatBody(props: ChatBodyProps) {
  return (
    <>
      <ChatBodyContent
        messages={props.messages}
        isStreaming={props.isStreaming}
        error={props.error}
        onRetry={props.onRetry}
        projectTitle={props.projectTitle}
      />
      <ChatFooter
        input={props.input}
        onInputChange={props.onInputChange}
        onKeyDown={props.onKeyDown}
        onSend={props.onSend}
        onStop={props.onStop}
        isStreaming={props.isStreaming}
        projectTitle={props.projectTitle}
      />
    </>
  );
}

interface ChatBodyContentProps {
  projectTitle: string;
  messages: UIMessage[];
  isStreaming: boolean;
  error: Error | undefined;
  onRetry: () => void;
}

function ChatBodyContent({
  projectTitle,
  messages,
  isStreaming,
  error,
  onRetry,
}: ChatBodyContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  const isEmpty = messages.length === 0;

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4"
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
      {error ? <ChatErrorCard error={error} onRetry={onRetry} /> : null}
    </div>
  );
}

interface ChatFooterProps {
  projectTitle: string;
  input: string;
  onInputChange: (value: string) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
}

function ChatFooter({
  projectTitle,
  input,
  onInputChange,
  onKeyDown,
  onSend,
  onStop,
  isStreaming,
}: ChatFooterProps) {
  return (
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
  );
}

function EmptyState({ projectTitle }: { projectTitle: string }) {
  return (
    <div className="flex flex-col items-start gap-2 text-left">
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

// ─── Message bubble: user pill / assistant markdown + reasoning ──────────

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

  let reasoningText = "";
  const textChunks: string[] = [];

  for (const part of message.parts) {
    if (part.type === "reasoning") {
      reasoningText = reasoningText
        ? `${reasoningText}\n\n${part.text}`
        : part.text;
    } else if (part.type === "text") {
      textChunks.push(part.text);
    }
  }

  const assistantText = textChunks.join("");

  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3"
    >
      <ReasoningAccordion text={reasoningText} isStreaming={isStreaming} />
      {assistantText ? (
        <ChatMarkdown text={assistantText} />
      ) : isStreaming ? (
        <span className="text-xs text-muted-foreground">Thinking…</span>
      ) : null}
    </motion.div>
  );
}

// ─── Compact markdown renderer tuned for chat (no headings, no images) ────

const chatMarkdownComponents: Components = {
  p({ children }) {
    return (
      <p className="text-sm leading-6 text-foreground [&:not(:first-child)]:mt-2">
        {children}
      </p>
    );
  },
  strong({ children }) {
    return <strong className="font-semibold text-foreground">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic text-foreground">{children}</em>;
  },
  ul({ children }) {
    return (
      <ul className="ml-4 list-disc space-y-1 text-sm leading-6 text-foreground">
        {children}
      </ul>
    );
  },
  ol({ children }) {
    return (
      <ol className="ml-4 list-decimal space-y-1 text-sm leading-6 text-foreground">
        {children}
      </ol>
    );
  },
  li({ children }) {
    return <li className="text-sm leading-6">{children}</li>;
  },
  a({ href, children }) {
    if (!href) return <span>{children}</span>;
    const isExternal = /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-baseline gap-1 text-foreground underline underline-offset-4 hover:no-underline"
        >
          {children}
          <ExternalLink
            className="size-3 shrink-0 translate-y-[1px]"
            aria-hidden="true"
          />
        </a>
      );
    }
    return (
      <Link
        href={href}
        className="text-foreground underline underline-offset-4 hover:no-underline"
      >
        {children}
      </Link>
    );
  },
  code({ children }) {
    return (
      <code className="rounded-sm bg-accent px-1 py-0.5 font-mono text-xs">
        {children}
      </code>
    );
  },
  h1: ({ children }) => (
    <p className="text-sm font-semibold text-foreground">{children}</p>
  ),
  h2: ({ children }) => (
    <p className="text-sm font-semibold text-foreground">{children}</p>
  ),
  h3: ({ children }) => (
    <p className="text-sm font-semibold text-foreground">{children}</p>
  ),
  img: () => null,
};

function ChatMarkdown({ text }: { text: string }) {
  return (
    <div className={cn("flex flex-col")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={chatMarkdownComponents}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
