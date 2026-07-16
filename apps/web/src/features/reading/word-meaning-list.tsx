"use client";

type WordMeaningListProps = {
  text: string;
  label: string;
};

type Pair = { word: string; gloss: string };

function parsePairs(text: string): Pair[] {
  const chunks = text
    .split(/[;|]+/)
    .map((c) => c.trim())
    .filter(Boolean);
  const pairs: Pair[] = [];
  for (const chunk of chunks) {
    // Telugu / Indic "word — gloss" or Devanagari + Latin gloss
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

/**
 * Word-by-word padacheda list (Sivananda-style meanings).
 */
export function WordMeaningList({ text, label }: WordMeaningListProps) {
  const pairs = parsePairs(text);
  if (pairs.length < 2) {
    return (
      <div>
        <h3 className="text-muted-foreground mb-3 text-xs uppercase tracking-[0.14em]">
          {label}
        </h3>
        <p className="text-verse-muted text-sm leading-relaxed whitespace-pre-line sm:text-base">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-muted-foreground mb-3 text-xs uppercase tracking-[0.14em]">
        {label}
      </h3>
      <ul className="text-verse-muted space-y-1.5 text-sm leading-relaxed sm:text-base">
        {pairs.map((pair, index) => (
          <li key={`${index}-${pair.word}`}>
            <span className="text-foreground font-medium">{pair.word}</span>
            <span className="text-muted-foreground"> — {pair.gloss}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
