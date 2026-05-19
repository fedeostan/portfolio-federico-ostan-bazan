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
