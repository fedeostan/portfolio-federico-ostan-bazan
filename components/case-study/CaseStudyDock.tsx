"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { Home, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProjectCategory } from "@/types/project";

export type CaseStudyDockGroup = {
  category: ProjectCategory;
  label: string;
  items: { slug: string; title: string }[];
};

type CaseStudyDockProps = {
  groups: CaseStudyDockGroup[];
  currentSlug: string;
  currentTitle: string;
};

const islandTransition: Transition = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.5,
};

function CircleProgress({ percentage }: { percentage: number }) {
  const size = 24;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CaseStudyDock({
  groups,
  currentSlug,
  currentTitle,
}: CaseStudyDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [vw, setVw] = useState<number | null>(null);
  const [vh, setVh] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        total > 0
          ? Math.min(100, Math.max(0, (window.scrollY / total) * 100))
          : 0,
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const update = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Default to desktop dimensions before mount so SSR markup is stable;
  // useEffect re-renders with the real viewport on mount. Framer Motion's
  // initial={false} on the pill prevents this re-render from animating.
  const isMobile = vw !== null && vw < 768;
  const collapsedWidth = isMobile ? 260 : 300;
  const expandedWidth =
    isMobile && vw !== null ? Math.min(360, vw - 32) : 340;
  const expandedHeight =
    isMobile && vh !== null ? Math.min(440, vh - 120) : 440;

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={islandTransition}
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[4px]"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-[30px] left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center"
      >
        <motion.div
          onClick={() => {
            if (!isExpanded) setIsExpanded(true);
          }}
          initial={false}
          animate={{
            width: isExpanded ? expandedWidth : collapsedWidth,
            height: isExpanded ? expandedHeight : 52,
            borderRadius: isExpanded ? 24 : 26,
          }}
          transition={islandTransition}
          style={{ cursor: isExpanded ? "default" : "pointer" }}
          className="border-foreground/10 bg-background text-foreground relative overflow-hidden border shadow-2xl"
        >
          {/* COLLAPSED PILL */}
          <motion.div
            initial={false}
            animate={{
              opacity: isExpanded ? 0 : 1,
              scale: isExpanded ? 0.95 : 1,
              filter: isExpanded ? "blur(4px)" : "blur(0px)",
            }}
            transition={{
              ...islandTransition,
              delay: isExpanded ? 0 : 0.1,
            }}
            className={cn(
              "absolute inset-0 flex items-center gap-3 pr-3 pl-4 sm:pl-5",
              isExpanded && "pointer-events-none",
            )}
          >
            <Link
              href="/"
              aria-label="Back to home"
              onClick={(e) => e.stopPropagation()}
              className="text-foreground/70 hover:text-foreground focus-visible:ring-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Home className="h-4 w-4" strokeWidth={2} />
            </Link>

            <div className="relative flex h-full flex-1 items-center overflow-hidden text-left">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={currentSlug}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="text-foreground block w-full overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap"
                >
                  {currentTitle}
                </motion.span>
              </AnimatePresence>
            </div>

            <CircleProgress percentage={progress} />
          </motion.div>

          {/* EXPANDED PANEL */}
          <motion.div
            initial={false}
            animate={{
              opacity: isExpanded ? 1 : 0,
              scale: isExpanded ? 1 : 1.05,
            }}
            transition={{
              ...islandTransition,
              delay: isExpanded ? 0.1 : 0,
            }}
            className={cn(
              "absolute inset-0 flex flex-col",
              !isExpanded && "pointer-events-none",
            )}
          >
            <div className="flex shrink-0 items-center justify-between px-6 pt-5 pb-3">
              <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.08em]">
                CASE STUDIES
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                aria-label="Close menu"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4"
              data-lenis-prevent="true"
            >
              <div className="flex flex-col gap-3">
                {groups.map((group) => (
                  <div key={group.category} className="flex flex-col gap-0.5">
                    <div className="text-foreground/60 px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide uppercase">
                      {group.label}
                    </div>
                    {group.items.map((item) => {
                      const isActive = item.slug === currentSlug;
                      return (
                        <Link
                          key={item.slug}
                          href={`/case-studies/${item.slug}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(false);
                          }}
                          className={cn(
                            "group flex w-full shrink-0 items-center rounded-lg border-none py-2 pr-3 pl-6 text-left text-sm transition-all duration-300 ease-out",
                            isActive &&
                              "bg-foreground/10 text-foreground font-medium",
                            !isActive &&
                              "text-foreground/55 hover:bg-foreground/5 hover:text-foreground/90",
                          )}
                        >
                          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap transition-transform duration-300 group-hover:translate-x-1">
                            {item.title}
                          </span>
                          <motion.div
                            initial={false}
                            animate={{
                              scale: isActive ? 1 : 0,
                              opacity: isActive ? 1 : 0,
                            }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-foreground ml-3 h-1.5 w-1.5 shrink-0 rounded-full"
                          />
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
