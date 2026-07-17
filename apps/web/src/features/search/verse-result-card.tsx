"use client";

import Link from "next/link";
import type { VerseSearchResult } from "@divine/types";
import { HighlightText, textContainsAny } from "./highlight-text";
import { MatchExplanation } from "./match-explanation";
import { TopicChip } from "./topic-chip";

type VerseResultCardProps = {
  result: VerseSearchResult;
  query: string;
  expandedTerms?: string[];
  onTermClick?: (term: string) => void;
};

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function VerseResultCard({
  result,
  query,
  expandedTerms = [],
  onTermClick,
}: VerseResultCardProps) {
  const highlightTerms = [
    ...new Set(
      [query, ...result.matchedKeywords, ...expandedTerms]
        .map((t) => t.trim())
        .filter((t) => t.length > 1),
    ),
  ];

  const sanskrit = clip(result.sanskrit, 160);
  const body = clip(result.preview || result.translation || "", 220);
  const corpus = `${result.sanskrit}\n${result.translation ?? ""}\n${result.preview}\n${result.transliteration ?? ""}`;
  const queryInVerse = textContainsAny(corpus, [query]);
  const foundInVerse = result.matchedKeywords.filter((k) =>
    textContainsAny(corpus, [k]),
  );

  return (
    <article className="border-border/60 group border-b py-5 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Link
          href={result.href}
          prefetch
          className="font-serif text-lg tracking-tight underline-offset-4 hover:underline"
        >
          {result.publicId}
        </Link>
        <span
          className="text-muted-foreground text-[11px] tabular-nums tracking-wide"
          title="Relevance score"
        >
          {result.score.toFixed(1)}
        </span>
      </div>

      {sanskrit ? (
        <p className="mt-2 font-serif text-base leading-relaxed md:text-lg">
          <HighlightText text={sanskrit} terms={highlightTerms} />
        </p>
      ) : null}

      {body ? (
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed md:text-[15px]">
          <HighlightText text={body} terms={highlightTerms} />
        </p>
      ) : null}

      <MatchExplanation
        query={query}
        foundTerms={
          foundInVerse.length > 0 ? foundInVerse : result.matchedKeywords
        }
        queryInVerse={queryInVerse}
      />

      {result.matchedKeywords.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground/80 text-[11px] tracking-wide">
            Matched:
          </span>
          {result.matchedKeywords.slice(0, 6).map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => onTermClick?.(kw)}
              className="border-border/70 text-muted-foreground hover:border-foreground/30 hover:text-foreground rounded-md border px-2 py-0.5 text-[11px] transition-divine"
            >
              {kw}
            </button>
          ))}
        </div>
      ) : null}

      {result.topics.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {result.topics.map((topic) => (
            <TopicChip
              key={topic.slug}
              slug={topic.slug}
              name={topic.name}
              href={`/search?q=${encodeURIComponent(query)}&topic=${encodeURIComponent(topic.slug)}`}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
