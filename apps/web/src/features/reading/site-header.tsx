import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

type SiteHeaderProps = {
  /** Optional trailing nav label (e.g. "Chapters"). */
  eyebrow?: string;
};

/**
 * Public site chrome — brand wordmark + theme toggle.
 * Server Component; ThemeToggle is the only client island.
 */
export function SiteHeader({ eyebrow }: SiteHeaderProps) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-content items-center justify-between px-6 py-6 md:py-8">
      <Link
        href="/"
        className="group flex items-center gap-2.5 rounded-md focus-visible:outline-none"
      >
        <span
          className="border-border bg-background/80 flex h-9 w-9 items-center justify-center rounded-lg border shadow-xs transition-divine group-hover:shadow-sm"
          aria-hidden
        >
          <span className="font-serif text-base leading-none">ॐ</span>
        </span>
        <span className="font-serif text-2xl tracking-tight">Divine</span>
      </Link>
      <div className="flex items-center gap-3">
        {eyebrow ? (
          <span className="text-muted-foreground hidden text-xs tracking-wide sm:inline">
            {eyebrow}
          </span>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  );
}
