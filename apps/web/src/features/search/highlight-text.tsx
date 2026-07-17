import * as React from "react";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when any of `terms` appears in `text` (case-insensitive). */
export function textContainsAny(text: string, terms: string[]): boolean {
  const hay = text.toLowerCase();
  return terms.some((t) => t.trim().length > 0 && hay.includes(t.toLowerCase()));
}

/**
 * Highlight every occurrence of `terms` in `text`.
 * Longer terms win first so "bhagavad gita" beats "gita".
 */
export function HighlightText({
  text,
  terms,
  className,
}: {
  text: string;
  terms: string[];
  className?: string;
}) {
  const unique = [
    ...new Set(
      terms
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .sort((a, b) => b.length - a.length),
    ),
  ];

  if (!text || unique.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const pattern = new RegExp(`(${unique.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const isHit = unique.some(
          (t) => t.toLowerCase() === part.toLowerCase(),
        );
        if (isHit) {
          return (
            <mark
              key={`${part}-${i}`}
              className="bg-foreground/10 text-foreground rounded-sm px-0.5 font-medium"
            >
              {part}
            </mark>
          );
        }
        return <React.Fragment key={`${part}-${i}`}>{part}</React.Fragment>;
      })}
    </span>
  );
}
