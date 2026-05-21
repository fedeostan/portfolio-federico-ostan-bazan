import type { ReactNode } from "react";

import { SectionShell } from "@/components/motion/SectionShell";
import { cn } from "@/lib/utils";

interface SectionShellWithHeaderProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

const HORIZONTAL_PADDING =
  "px-6 md:px-12 2xl:px-[max(8rem,calc(50vw-700px))]";

export function SectionShellWithHeader({
  id,
  title,
  description,
  children,
  className,
}: SectionShellWithHeaderProps) {
  const headingId = `${id}-heading`;
  return (
    <SectionShell
      id={id}
      className={cn("bg-background min-h-0 md:min-h-svh", className)}
      aria-labelledby={headingId}
    >
      <div className="flex w-full max-w-[1796px] flex-col gap-8 pt-10 pb-16 md:gap-10 md:pt-16 md:pb-28">
        <header
          className={cn(
            "flex max-w-[610px] flex-col gap-6",
            HORIZONTAL_PADDING,
          )}
        >
          <h2
            id={headingId}
            className="text-foreground text-2xl leading-8 font-semibold"
          >
            {title}
          </h2>
          <p className="text-muted-foreground text-base leading-6 font-medium">
            {description}
          </p>
        </header>
        {children}
      </div>
    </SectionShell>
  );
}
