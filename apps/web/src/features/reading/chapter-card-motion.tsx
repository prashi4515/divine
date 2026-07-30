"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ChapterCardMotionProps = {
  children: React.ReactNode;
  /** Zero-based index — drives stagger delay and motion variant. */
  index: number;
  className?: string;
};

type MotionVariant = "bloom" | "drift" | "sweep";

function variantFor(index: number): MotionVariant {
  const variants: MotionVariant[] = ["bloom", "drift", "sweep"];
  return variants[index % 3]!;
}

/**
 * Scroll-triggered chapter card entrance — cycles bloom / drift / sweep
 * (not the old fade-up Reveal). Honors prefers-reduced-motion.
 */
export function ChapterCardMotion({
  children,
  index,
  className,
}: ChapterCardMotionProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const variant = variantFor(index);
  const delayMs = reduceMotion ? 0 : Math.min(index, 11) * 55;

  return (
    <div
      ref={ref}
      className={cn(
        "h-full will-change-transform",
        !reduceMotion && "chapter-card-motion",
        !reduceMotion && visible && `chapter-card-motion--${variant}`,
        !reduceMotion && !visible && "chapter-card-motion--pending",
        className,
      )}
      style={
        visible && !reduceMotion
          ? { animationDelay: `${delayMs}ms` }
          : undefined
      }
    >
      {children}
    </div>
  );
}
