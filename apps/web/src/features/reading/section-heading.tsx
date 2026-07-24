import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  children: string;
  className?: string;
};

/**
 * Highlighted section bar for Translation / Commentary
 * (inspired by holy-bhagavad-gita.org orange bars — saffron, not copied).
 */
export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <h3
      className={cn(
        "cta-saffron mb-4 rounded-md px-4 py-2.5 text-center text-sm font-semibold tracking-wide text-white shadow-xs",
        className,
      )}
    >
      {children}
    </h3>
  );
}
