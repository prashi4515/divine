"use client";

import * as React from "react";
import type { Verse } from "@divine/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  Share2,
} from "lucide-react";

type LanguageOption = {
  code: string;
  name: string;
  nativeName: string | null;
};

type VerseReaderProps = {
  chapterNumber: number;
  verses: Verse[];
  languages: LanguageOption[];
  initialLanguage?: string;
};

function pickTranslation(verse: Verse, language: string): string | null {
  if (language === "sa") return verse.sanskritText;
  const match = verse.translations.find((t) => t.languageCode === language);
  return match?.text ?? null;
}

export function VerseReader({
  chapterNumber,
  verses,
  languages,
  initialLanguage = "en",
}: VerseReaderProps) {
  const [language, setLanguage] = React.useState(initialLanguage);
  const [index, setIndex] = React.useState(0);
  const [bookmark, setBookmark] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [jump, setJump] = React.useState("");

  const verse = verses[index] ?? null;
  const progress =
    verses.length === 0 ? 0 : Math.round(((index + 1) / verses.length) * 100);

  React.useEffect(() => {
    const hash = window.location.hash.match(/^#verse-(\d+)$/);
    if (!hash) return;
    const n = Number.parseInt(hash[1]!, 10);
    const found = verses.findIndex((v) => v.number === n);
    if (found >= 0) setIndex(found);
  }, [verses]);

  React.useEffect(() => {
    if (!verse) return;
    const next = `#verse-${verse.number}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [verse]);

  const translation = verse ? pickTranslation(verse, language) : null;

  async function copyVerse() {
    if (!verse) return;
    const text = [
      verse.publicId,
      verse.sanskritText,
      translation,
      verse.meaning,
    ]
      .filter(Boolean)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function shareVerse() {
    if (!verse) return;
    const url = `${window.location.origin}${window.location.pathname}#verse-${verse.number}`;
    if (navigator.share) {
      await navigator.share({
        title: verse.publicId,
        text: translation ?? verse.sanskritText,
        url,
      });
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function goToJump() {
    const n = Number.parseInt(jump, 10);
    if (!Number.isFinite(n)) return;
    const found = verses.findIndex((v) => v.number === n);
    if (found >= 0) {
      setIndex(found);
      setJump("");
    }
  }

  if (verses.length === 0) {
    return (
      <section className="border-border rounded-xl border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No published verses in chapter {chapterNumber} yet.
        </p>
      </section>
    );
  }

  return (
    <section id="reader" aria-labelledby="reader-heading" className="scroll-mt-24 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="reader-heading" className="font-serif text-xl tracking-tight sm:text-2xl">
            Verses
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {index + 1} of {verses.length} · {progress}% through this chapter
          </p>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">Language</span>
          <select
            className="border-input bg-background h-9 min-w-[10rem] rounded-md border px-3 text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Translation language"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
                {lang.nativeName ? ` (${lang.nativeName})` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="bg-muted/40 h-1.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      >
        <div
          className="bg-foreground/70 h-full transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {verse ? (
        <article
          id={`verse-${verse.number}`}
          className="border-border bg-card animate-fade-up rounded-xl border p-6 shadow-xs sm:p-10"
          aria-label={`Verse ${verse.number}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground font-mono text-[11px] tracking-wide">
              {verse.publicId}
            </p>
            <Badge variant="muted" className="tracking-wide">
              Verse {verse.number}
            </Badge>
          </div>

          <div className="mt-8 space-y-8">
            <div>
              <p className="text-muted-foreground mb-3 text-xs uppercase tracking-[0.14em]">
                Original
              </p>
              <p className="text-sanskrit font-serif text-xl leading-verse tracking-wide whitespace-pre-line sm:text-2xl">
                {verse.sanskritText}
              </p>
              {verse.transliteration ? (
                <p className="text-muted-foreground mt-3 text-sm italic leading-relaxed whitespace-pre-line">
                  {verse.transliteration}
                </p>
              ) : null}
            </div>

            <div>
              <p className="text-muted-foreground mb-3 text-xs uppercase tracking-[0.14em]">
                {language === "sa" ? "Sanskrit" : "Translation"}
              </p>
              {translation ? (
                <p className="text-verse text-base leading-relaxed whitespace-pre-line sm:text-lg">
                  {translation}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No {language === "sa" ? "Sanskrit text" : "translation"} for this
                  verse yet.
                </p>
              )}
            </div>

            {verse.meaning ? (
              <div>
                <p className="text-muted-foreground mb-3 text-xs uppercase tracking-[0.14em]">
                  Meaning
                </p>
                <p className="text-verse-muted text-sm leading-relaxed sm:text-base">
                  {verse.meaning}
                </p>
              </div>
            ) : null}

            {verse.commentary ? (
              <div>
                <p className="text-muted-foreground mb-3 text-xs uppercase tracking-[0.14em]">
                  Commentary
                </p>
                <p className="text-verse-muted text-sm leading-relaxed sm:text-base">
                  {verse.commentary}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={index >= verses.length - 1}
              onClick={() => setIndex((i) => Math.min(verses.length - 1, i + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                className="border-input bg-background h-8 w-20 rounded-md border px-2 text-sm"
                placeholder="Jump"
                value={jump}
                onChange={(e) => setJump(e.target.value)}
                aria-label="Jump to verse number"
              />
              <Button type="button" variant="ghost" size="sm" onClick={goToJump}>
                Go
              </Button>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => void copyVerse()}>
                <Copy className="h-4 w-4" aria-hidden />
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => void shareVerse()}>
                <Share2 className="h-4 w-4" aria-hidden />
                Share
              </Button>
              <Button
                type="button"
                variant={bookmark ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setBookmark((v) => !v)}
                aria-pressed={bookmark}
              >
                <Bookmark className="h-4 w-4" aria-hidden />
                {bookmark ? "Bookmarked" : "Bookmark"}
              </Button>
            </div>
          </div>
        </article>
      ) : null}
    </section>
  );
}
