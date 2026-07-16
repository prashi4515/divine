"use client";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  children: string;
  className?: string;
};

/**
 * Highlighted section bar for Translation / Commentary (holy-bhagavad-gita style).
 */
export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <h3
      className={cn(
        "bg-foreground text-background mb-4 rounded-md px-4 py-2.5 text-center text-sm font-medium tracking-wide",
        className,
      )}
    >
      {children}
    </h3>
  );
}
