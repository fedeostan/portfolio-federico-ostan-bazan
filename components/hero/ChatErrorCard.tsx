"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatErrorVariant = "rate-limit" | "network" | "blocked" | "server";

const COPY: Record<ChatErrorVariant, { headline: string; sub: string }> = {
  "rate-limit": {
    headline: "Lots of people are chatting with me right now.",
    sub: "Give it a few seconds and try again.",
  },
  network: {
    headline: "Looks like your connection blinked.",
    sub: "Check your network and retry.",
  },
  blocked: {
    headline: "My bot filter got a little suspicious.",
    sub: "You're clearly human — give it a second and retry.",
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
  if (msg.includes("403") || msg.includes("forbidden")) return "blocked";
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
