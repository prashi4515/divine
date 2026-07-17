type MatchExplanationProps = {
  query: string;
  /** Terms found in this verse (matched keywords + highlighted hits). */
  foundTerms: string[];
  /** True when the typed query itself appears in verse text. */
  queryInVerse: boolean;
};

/**
 * Explains synonym / spelling matches when the typed word is not in the verse.
 */
export function MatchExplanation({
  query,
  foundTerms,
  queryInVerse,
}: MatchExplanationProps) {
  const q = query.trim();
  if (!q || queryInVerse || foundTerms.length === 0) return null;

  const shown = foundTerms.slice(0, 5);

  return (
    <p className="border-border/50 bg-muted/40 text-muted-foreground mt-2 rounded-md border px-2.5 py-2 text-[11px] leading-relaxed">
      <span className="text-foreground font-medium">“{q}”</span> is not written
      in this verse. Shown because it relates to{" "}
      <span className="text-foreground">
        {shown.map((t, i) => (
          <span key={t}>
            {i > 0 ? ", " : null}
            <span className="font-medium">{t}</span>
          </span>
        ))}
      </span>
      .
    </p>
  );
}
