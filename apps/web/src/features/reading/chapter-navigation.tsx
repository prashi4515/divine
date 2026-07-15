import Link from "next/link";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChapterNavigationProps = {
  currentNumber: number;
  totalChapters: number;
  listHref: string;
  chapterHref: (n: number) => string;
};

/**
 * Previous / list / next chapter controls for the reader footer.
 */
export function ChapterNavigation({
  currentNumber,
  totalChapters,
  listHref,
  chapterHref,
}: ChapterNavigationProps) {
  const prev = currentNumber > 1 ? currentNumber - 1 : null;
  const next = currentNumber < totalChapters ? currentNumber + 1 : null;

  return (
    <nav
      aria-label="Chapter navigation"
      className="border-border bg-card/60 rounded-xl border p-3 shadow-xs sm:p-4"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {prev !== null ? (
          <Button
            asChild
            variant="ghost"
            className="h-11 justify-start sm:justify-center"
          >
            <Link href={chapterHref(prev)} aria-label={`Previous chapter, Chapter ${prev}`}>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Previous Chapter
            </Link>
          </Button>
        ) : (
          <Button
            variant="ghost"
            disabled
            className="h-11 justify-start sm:justify-center"
            aria-label="Previous chapter unavailable"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous Chapter
          </Button>
        )}

        <Button
          asChild
          variant="outline"
          className={cn("h-11", "order-first sm:order-none")}
        >
          <Link href={listHref} aria-label="Back to chapter list">
            <List className="h-4 w-4" aria-hidden />
            Chapter List
          </Link>
        </Button>

        {next !== null ? (
          <Button
            asChild
            variant="ghost"
            className="h-11 justify-end sm:justify-center"
          >
            <Link href={chapterHref(next)} aria-label={`Next chapter, Chapter ${next}`}>
              Next Chapter
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        ) : (
          <Button
            variant="ghost"
            disabled
            className="h-11 justify-end sm:justify-center"
            aria-label="Next chapter unavailable"
          >
            Next Chapter
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>
    </nav>
  );
}
