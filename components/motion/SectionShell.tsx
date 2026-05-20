import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionShellProps {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div" | "article";
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export function SectionShell({
  children,
  className,
  id,
  as: Tag = "section",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SectionShellProps) {
  return (
    <Tag
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "relative grid h-svh w-full snap-start snap-always scroll-mt-0 place-items-center",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
