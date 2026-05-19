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
