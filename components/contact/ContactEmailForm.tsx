"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { leadSchema, type LeadInput } from "@/lib/db/leads";

interface ContactEmailFormProps {
  onBack: () => void;
  onClose: () => void;
}

type Status = "idle" | "submitting" | "success" | "error";

export function ContactEmailForm({ onBack, onClose }: ContactEmailFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LeadInput>({
    resolver: standardSchemaResolver(leadSchema),
    defaultValues: { email: "", message: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: LeadInput) {
    setStatus("submitting");
    setServerError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setServerError(data?.error ?? "Something went wrong. Try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setServerError("Network error — check your connection and retry.");
      setStatus("error");
    }
  }

  return (
    <div className="bg-background border-border flex w-[342px] max-w-full flex-col gap-6 overflow-clip rounded-[26px] border p-3 shadow-lg">
      <div className="flex w-full items-start justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to contact options"
          className="text-foreground hover:bg-secondary inline-flex items-center justify-center rounded-[10px] p-[10px] transition-colors"
        >
          <Icon name="ChevronLeft" size={24} />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close contact form"
          className="text-foreground hover:bg-secondary inline-flex items-center justify-center rounded-[10px] p-[10px] transition-colors"
        >
          <Icon name="X" size={24} />
        </button>
      </div>

      {status === "success" ? (
        <div className="flex flex-col gap-2 px-1 pb-2 text-left">
          <p className="text-foreground text-lg leading-7 font-semibold">
            Thanks — Federico will reach out
          </p>
          <p className="text-muted-foreground text-base leading-6 font-medium">
            I&apos;ll get back to you at this email soon. Talk soon.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 px-1">
            <p className="text-foreground text-lg leading-7 font-semibold">
              Get contacted via email
            </p>
            <p className="text-muted-foreground text-base leading-6 font-medium">
              Drop your email and a note. I&apos;ll reach out from my
              personal email.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full flex-col gap-3"
              noValidate
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Your email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Your message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a note"
                        rows={3}
                        className="min-h-[76px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError ? (
                <p
                  className="text-destructive text-sm leading-5"
                  role="alert"
                >
                  {serverError}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={status === "submitting"}
                className="bg-primary text-primary-foreground h-9 w-full rounded-[10px]"
              >
                {status === "submitting" ? "Sending…" : "Send"}
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
