"use client";

import Link from "next/link";
import type { Chapter } from "@divine/types";
import { ArrowRight } from "lucide-react";
import { useMessages } from "@/lib/i18n/use-messages";
import { cn } from "@/lib/utils";

type ChapterCardProps = {
  chapter: Chapter;
  /** Overrides default path derivation when set. */
  basePath?: string;
};

function chapterHref(chapter: Chapter, basePath?: string): string {
  if (basePath) return `${basePath}/chapter-${chapter.number}`;
  if (chapter.work.code === "bg") return `/bhagavad-gita/chapter-${chapter.number}`;
  return `/scriptures/${chapter.work.slug}/chapter-${chapter.number}`;
}

/**
 * Interactive chapter tile for the public explorer.
 * Cards are intentional here — each is a reading entry point.
 */
export function ChapterCard({ chapter, basePath }: ChapterCardProps) {
  const t = useMessages();
  const href = chapterHref(chapter, basePath);
  const title =
    chapter.work.code === "bg"
      ? t.chapterTitle(chapter.number, chapter.title)
      : chapter.title?.trim() || t.chapterFallback(chapter.number);
  const verseLabel =
    chapter.verseCount === 1
      ? `1 ${t.verseSingular}`
      : `${chapter.verseCount} ${t.verses}`;

  return (
    <li>
      <Link
        href={href}
        prefetch={true}
        className={cn(
          "group border-border bg-card relative flex h-full flex-col rounded-xl border p-4 shadow-xs sm:p-5",
          "transition-divine hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <p
            className="text-muted-foreground/80 font-serif text-4xl leading-none tracking-tight tabular-nums sm:text-5xl"
            aria-hidden
          >
            {String(chapter.number).padStart(2, "0")}
          </p>
          <span className="text-muted-foreground font-mono text-[11px] tracking-wide">
            {chapter.publicId}
          </span>
        </div>

        <h2 className="mt-4 font-serif text-lg leading-snug tracking-tight sm:text-xl">
          {title}
        </h2>

        <p className="text-muted-foreground mt-1.5 text-sm">{verseLabel}</p>

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-foreground inline-flex items-center gap-1.5 text-sm font-medium group-hover:underline">
            {t.read}
            <ArrowRight
              className="h-3.5 w-3.5 transition-divine group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </div>
      </Link>
    </li>
  );
}
