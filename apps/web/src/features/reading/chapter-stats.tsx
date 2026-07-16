"use client";

import type { ReactNode } from "react";
import { BookOpen, Clock, Sparkles } from "lucide-react";
import { estimateReadingMinutes } from "@/features/reading/chapter-reading";
import { useMessages } from "@/lib/i18n/use-messages";
import { cn } from "@/lib/utils";

type ChapterStatsProps = {
  verseCount: number;
};

type StatCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
};

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div
      className={cn(
        "border-border bg-card group rounded-xl border p-6 shadow-xs",
        "transition-divine hover:-translate-y-0.5 hover:border-foreground/12 hover:shadow-md",
      )}
    >
      <div className="text-muted-foreground flex items-center gap-2 text-xs uppercase tracking-[0.14em]">
        <span className="text-muted-foreground/80 transition-divine group-hover:text-foreground/70">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-4 font-serif text-3xl tracking-tight tabular-nums sm:text-4xl">
        {value}
      </p>
    </div>
  );
}

/**
 * Three quiet metrics — verses from the API, estimated time, theme.
 */
export function ChapterStats({ verseCount }: ChapterStatsProps) {
  const t = useMessages();
  const minutes = estimateReadingMinutes(verseCount);
  const verseValue =
    verseCount === 1 ? "1" : verseCount > 0 ? String(verseCount) : "0";
  const timeValue = minutes === null ? "—" : t.minutes(minutes);

  return (
    <section aria-labelledby="chapter-stats-heading" className="animate-fade-in">
      <h2 id="chapter-stats-heading" className="sr-only">
        {t.verses}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t.verses}
          value={verseValue}
          icon={<BookOpen className="h-3.5 w-3.5" aria-hidden />}
        />
        <StatCard
          label={t.readingTime}
          value={timeValue}
          icon={<Clock className="h-3.5 w-3.5" aria-hidden />}
        />
        <StatCard
          label={t.theme}
          value="Yoga"
          icon={<Sparkles className="h-3.5 w-3.5" aria-hidden />}
        />
      </div>
    </section>
  );
}
