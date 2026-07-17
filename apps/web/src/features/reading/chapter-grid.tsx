import type { Chapter } from "@divine/types";
import { BookOpen } from "lucide-react";
import { ChapterCard } from "./chapter-card";

type ChapterGridProps = {
  chapters: Chapter[];
  /** Base path for chapter links, e.g. `/bhagavad-gita` or `/scriptures/bible`. */
  basePath?: string;
};

export function ChapterGrid({ chapters, basePath }: ChapterGridProps) {
  if (chapters.length === 0) {
    return (
      <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-20 text-center">
        <div className="border-border bg-muted/40 mb-4 flex h-10 w-10 items-center justify-center rounded-lg border">
          <BookOpen className="text-muted-foreground h-4 w-4" aria-hidden />
        </div>
        <p className="font-serif text-xl tracking-tight">No chapters yet</p>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
          Published chapters will appear here once the catalog is imported.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5">
      {chapters.map((chapter) => (
        <ChapterCard key={chapter.id} chapter={chapter} basePath={basePath} />
      ))}
    </ul>
  );
}
