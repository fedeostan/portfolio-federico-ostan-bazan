import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionShellProps {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div" | "article";
}

export function SectionShell({
  children,
  className,
  id,
  as: Tag = "section",
}: SectionShellProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "relative grid h-svh w-full snap-start snap-always scroll-mt-0 place-items-center",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
