import { cn } from "@/lib/utils";

interface HeroBackgroundProps {
  className?: string;
}

export function HeroBackground({ className }: HeroBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 -z-10 bg-background", className)}
    />
  );
}
