"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/use-messages";
import { cn } from "@/lib/utils";

type ChapterNavigationProps = {
  currentNumber: number;
  totalChapters: number;
  listHref: string;
  /** Precomputed hrefs — must be strings (Client Components cannot receive functions). */
  prevHref: string | null;
  nextHref: string | null;
};

/**
 * Previous / list / next chapter controls for the reader footer.
 */
export function ChapterNavigation({
  currentNumber,
  totalChapters,
  listHref,
  prevHref,
  nextHref,
}: ChapterNavigationProps) {
  const t = useMessages();
  const prev = prevHref != null && currentNumber > 1 ? currentNumber - 1 : null;
  const next =
    nextHref != null && currentNumber < totalChapters ? currentNumber + 1 : null;

  return (
    <nav
      aria-label="Chapter navigation"
      className="border-border bg-card/60 rounded-xl border p-3 shadow-xs sm:p-4"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {prev !== null && prevHref ? (
          <Button
            asChild
            variant="ghost"
            className="h-11 justify-start sm:justify-center"
          >
            <Link
              href={prevHref}
              aria-label={`${t.previousChapter}, ${t.chapterFallback(prev)}`}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              {t.previousChapter}
            </Link>
          </Button>
        ) : (
          <Button
            variant="ghost"
            disabled
            className="h-11 justify-start sm:justify-center"
            aria-label={t.previousChapter}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {t.previousChapter}
          </Button>
        )}

        <Button
          asChild
          variant="outline"
          className={cn("h-11", "order-first sm:order-none")}
        >
          <Link href={listHref} aria-label={t.allChapters}>
            <List className="h-4 w-4" aria-hidden />
            {t.allChapters}
          </Link>
        </Button>

        {next !== null && nextHref ? (
          <Button
            asChild
            variant="ghost"
            className="h-11 justify-end sm:justify-center"
          >
            <Link
              href={nextHref}
              aria-label={`${t.nextChapter}, ${t.chapterFallback(next)}`}
            >
              {t.nextChapter}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        ) : (
          <Button
            variant="ghost"
            disabled
            className="h-11 justify-end sm:justify-center"
            aria-label={t.nextChapter}
          >
            {t.nextChapter}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>
    </nav>
  );
}
