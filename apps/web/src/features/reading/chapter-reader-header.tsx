import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type ChapterReaderHeaderProps = {
  /** Back destination — typically the scripture chapter list. */
  backHref?: string;
  backLabel?: string;
};

/**
 * Quiet reader chrome: back to scripture, context label, theme toggle.
 * Server Component; ThemeToggle is the only client island.
 */
export function ChapterReaderHeader({
  backHref = "/bhagavad-gita",
  backLabel = "Bhagavad Gita",
}: ChapterReaderHeaderProps) {
  return (
    <header className="border-border/60 relative z-10 border-b">
      <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-6 py-4 md:py-5">
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground group inline-flex min-h-11 items-center gap-2 rounded-md text-sm transition-divine focus-visible:outline-none"
        >
          <ArrowLeft
            className="h-4 w-4 transition-divine group-hover:-translate-x-0.5"
            aria-hidden
          />
          <span>{backLabel}</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground hidden text-xs tracking-wide sm:inline">
            Reader
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
