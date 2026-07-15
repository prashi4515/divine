type ReadingProgressProps = {
  /** 0–100. Defaults to 0 until verses exist. */
  percent?: number;
};

/**
 * Calm progress strip for the chapter reading journey.
 * Remains at 0% until a real verse reader can track progress.
 */
export function ReadingProgress({ percent = 0 }: ReadingProgressProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const label = `${clamped}%`;

  return (
    <section
      aria-labelledby="reading-progress-heading"
      className="border-border bg-card animate-fade-in rounded-xl border p-6 shadow-xs sm:p-8"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="reading-progress-heading"
            className="font-serif text-xl tracking-tight sm:text-2xl"
          >
            Reading Progress
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
            Progress begins after verses are available.
          </p>
        </div>
        <p
          className="font-serif text-3xl tabular-nums tracking-tight sm:text-4xl"
          aria-live="polite"
        >
          {label}
        </p>
      </div>

      <div
        className="bg-muted mt-8 h-1.5 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Chapter reading progress"
      >
        <div
          className="bg-foreground/80 h-full rounded-full transition-divine"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </section>
  );
}
