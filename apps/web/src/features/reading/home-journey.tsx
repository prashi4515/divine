"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Search,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import {
  useHomeMessages,
  useMessages,
  useUiLanguage,
} from "@/lib/i18n/use-messages";
import { getVerseOfTheDay } from "@/lib/reading/verse-of-the-day";
import { localizePath } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type Path = {
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
  cta: string;
};

/**
 * "Three ways to begin" — a soft, numbered set of on-ramps into the reader.
 */
export function HomeJourney() {
  const lang = useUiLanguage();
  const t = useMessages(lang);
  const h = useHomeMessages(lang);
  const today = getVerseOfTheDay();
  const todayHref = localizePath(
    `/bhagavad-gita/chapter-${today.chapter}#verse-${today.verse}`,
    lang,
  );

  const paths: Path[] = [
    {
      icon: BookOpenText,
      title: h.pathChapterTitle ?? "Read chapter by chapter",
      body:
        h.pathChapterBody ??
        "Eighteen chapters, each a complete teaching. Move at your own pace.",
      href: localizePath("/bhagavad-gita", lang),
      cta: t.allChapters ?? "All chapters",
    },
    {
      icon: Sunrise,
      title: h.pathDailyTitle ?? "One verse a day",
      body:
        h.pathDailyBody ??
        "A single shloka to sit with - arrives with the sunrise in Kolkata.",
      href: todayHref,
      cta: h.todaysVerse,
    },
    {
      icon: Search,
      title: h.pathSearchTitle ?? "Search a theme",
      body:
        h.pathSearchBody ??
        "Duty, devotion, dispassion, doubt - find verses that meet your question.",
      href: localizePath("/search", lang),
      cta: h.searchVerses,
    },
  ];

  return (
    <section className="page-gutter relative w-full py-16 sm:py-20 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-saffron text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs">
          {h.journeyEyebrow ?? "Three ways to begin"}
        </p>
        <h2 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
          {h.journeyHeading ?? "Choose your path in"}
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg">
          {h.journeySubheading ??
            "There is no wrong way to read the Gita. Start where the moment takes you."}
        </p>
      </header>

      <ol className="mx-auto mt-10 grid w-full max-w-6xl grid-cols-1 gap-4 sm:mt-14 sm:gap-5 md:grid-cols-3">
        {paths.map((p, i) => (
          <li key={p.title} className="h-full">
            <PathCard path={p} index={i + 1} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function PathCard({ path, index }: { path: Path; index: number }) {
  const Icon = path.icon;
  return (
    <Link
      href={path.href}
      className={cn(
        "group border-border/70 bg-card hover:border-saffron/40 transition-divine relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 shadow-xs hover:shadow-md sm:p-7",
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-divine group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--saffron) / 0.7), transparent)",
        }}
        aria-hidden
      />
      <div className="flex items-center justify-between">
        <span
          className="text-saffron flex h-11 w-11 items-center justify-center rounded-xl border"
          style={{
            background: "hsl(var(--saffron) / 0.1)",
            borderColor: "hsl(var(--saffron) / 0.25)",
          }}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-muted-foreground/60 font-serif text-4xl leading-none tabular-nums">
          0{index}
        </span>
      </div>
      <h3 className="mt-6 font-serif text-xl tracking-tight sm:text-2xl">
        {path.title}
      </h3>
      <p className="text-muted-foreground mt-3 flex-1 text-sm leading-relaxed sm:text-base">
        {path.body}
      </p>
      <span className="text-maroon group-hover:text-saffron mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-divine">
        {path.cta}
        <ArrowRight
          className="h-3.5 w-3.5 transition-divine group-hover:translate-x-1"
          aria-hidden
        />
      </span>
    </Link>
  );
}
