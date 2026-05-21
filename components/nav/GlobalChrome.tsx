"use client";

import { usePathname } from "next/navigation";

import { BottomDock } from "@/components/nav/BottomDock";

export function GlobalChrome() {
  const pathname = usePathname();
  const isCaseStudy = pathname?.startsWith("/case-studies/") ?? false;

  if (isCaseStudy) return null;
  return <BottomDock />;
}
