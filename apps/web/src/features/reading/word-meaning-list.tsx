"use client";

import * as React from "react";

type WordMeaningListProps = {
  text: string;
  label: string;
  /** Collapse long lists after this many pairs (holy-bg style). */
  collapsedCount?: number;
};

type Pair = { word: string; gloss: string };

function parsePairs(text: string): Pair[] {
  const chunks = text
    .split(/[;|]+/)
    .map((c) => c.trim())
    .filter(Boolean);
  const pairs: Pair[] = [];
  for (const chunk of chunks) {
    const emDash = chunk.match(/^(.+?)\s+[—–-]\s+(.+)$/u);
    if (emDash) {
      pairs.push({ word: emDash[1]!.trim(), gloss: emDash[2]!.trim() });
      continue;
    }
    const match = chunk.match(
      /^([\u0900-\u097F\u0C00-\u0C7F\u0B80-\u0BFF\u0C80-\u0CFF\u0D00-\u0D7F\u0B00-\u0B7F]+)\s+(.+)$/u,
    );
    if (match) {
      pairs.push({ word: match[1]!, gloss: match[2]!.trim() });
      continue;
    }
    const space = chunk.match(/^(\S+)\s+(.+)$/);
    if (space) {
      pairs.push({ word: space[1]!, gloss: space[2]!.trim() });
    }
  }
  return pairs;
}

function MeaningRow({
  pair,
  striped,
}: {
  pair: Pair;
  striped: boolean;
}) {
  return (
    <li
      className={
        striped
          ? "bg-muted/45 px-3 py-2 sm:px-4"
          : "bg-background px-3 py-2 sm:px-4"
      }
    >
      <span className="text-primary font-medium">{pair.word}</span>
      <span className="text-muted-foreground"> — </span>
      <span className="text-foreground">{pair.gloss}</span>
    </li>
  );
}

/**
 * Word-by-word meanings — two-column zebra table (holy-bhagavad-gita style).
 */
export function WordMeaningList({
  text,
  label,
  collapsedCount = 12,
}: WordMeaningListProps) {
  const pairs = parsePairs(text);
  const [expanded, setExpanded] = React.useState(false);

  if (pairs.length < 2) {
    return (
      <div>
        <h3 className="text-muted-foreground mb-3 text-center text-xs uppercase tracking-[0.14em]">
          {label}
        </h3>
        <p className="text-verse-muted text-center text-sm leading-relaxed whitespace-pre-line sm:text-base">
          {text}
        </p>
      </div>
    );
  }

  const canCollapse = pairs.length > collapsedCount;
  const visible = !canCollapse || expanded ? pairs : pairs.slice(0, collapsedCount);
  const mid = Math.ceil(visible.length / 2);
  const left = visible.slice(0, mid);
  const right = visible.slice(mid);

  return (
    <div>
      <h3 className="text-muted-foreground mb-3 text-center text-xs uppercase tracking-[0.14em]">
        {label}
      </h3>
      <div className="border-border overflow-hidden rounded-md border">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <ul className="text-sm leading-relaxed sm:border-r sm:border-border sm:text-[0.9375rem]">
            {left.map((pair, index) => (
              <MeaningRow
                key={`l-${index}-${pair.word}`}
                pair={pair}
                striped={index % 2 === 1}
              />
            ))}
          </ul>
          <ul className="text-sm leading-relaxed sm:text-[0.9375rem]">
            {right.map((pair, index) => (
              <MeaningRow
                key={`r-${index}-${pair.word}`}
                pair={pair}
                striped={index % 2 === 1}
              />
            ))}
          </ul>
        </div>
      </div>
      {canCollapse ? (
        <div className="mt-3 text-center">
          <button
            type="button"
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "See less" : "See more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
