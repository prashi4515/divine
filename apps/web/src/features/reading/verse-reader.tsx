"use client";

import * as React from "react";
import type { Verse } from "@divine/types";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/features/reading/section-heading";
import { VerseNumberGrid } from "@/features/reading/verse-number-grid";
import { WordMeaningList } from "@/features/reading/word-meaning-list";
import { RelatedReading } from "@/features/search/related-reading";
import { useMessages } from "@/lib/i18n/use-messages";
import {
  isIndicScriptLanguage,
  shlokaInLanguage,
} from "@/lib/reading/shloka-script";
import { useReadingStore } from "@/lib/stores/reading-store";

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

const VYAKHYA_SOURCES = new Set([
  "ramsukhdas-vyakhya",
  "ramsukhdas-vyakhya-kn",
  "ramsukhdas-vyakhya-ta",
  "ramsukhdas-vyakhya-ml",
  "ramsukhdas-vyakhya-or",
  "holy-bg-telugu-vyakhya",
]);

const W2W_SOURCES = new Set(["holy-bg-telugu-w2w"]);

const COMMENTARY_LANGUAGES = new Set([
  "en",
  "hi",
  "te",
  "kn",
  "ta",
  "ml",
  "or",
  "sa",
]);

/** Strip corpus prefixes like "BG 1.16-18:" — the UI adds BG n.m itself. */
function formatTranslationText(text: string): string {
  return text
    .replace(/^\s*BG\s+\d+\.\d+(?:-\d+(?:\.\d+)?)?:\s*/i, "")
    .trim();
}

function pickTranslation(verse: Verse, language: string): string | null {
  if (language === "sa") return verse.sanskritText;
  const match = verse.translations.find(
    (t) =>
      t.languageCode === language &&
      !VYAKHYA_SOURCES.has(t.sourceKey) &&
      !W2W_SOURCES.has(t.sourceKey),
  );
  return match?.text ? formatTranslationText(match.text) : null;
}

function pickWordMeanings(verse: Verse, language: string): string | null {
  const localized = verse.translations.find(
    (t) => t.languageCode === language && W2W_SOURCES.has(t.sourceKey),
  );
  if (localized?.text) return localized.text;
  if (language === "en") return verse.meaning?.trim() || null;
  return null;
}

function pickCommentary(verse: Verse, language: string): string | null {
  const localized = verse.translations.find(
    (t) => t.languageCode === language && VYAKHYA_SOURCES.has(t.sourceKey),
  );
  if (localized?.text) return localized.text;
  if (language === "sa") {
    const hi = verse.translations.find(
      (t) => t.languageCode === "hi" && t.sourceKey === "ramsukhdas-vyakhya",
    );
    if (hi?.text) return hi.text;
    return null;
  }
  if (language === "en") return verse.commentary?.trim() || null;
  return null;
}

function resolveLanguage(
  preferred: string,
  languages: LanguageOption[],
  fallback: string,
): string {
  if (languages.some((lang) => lang.code === preferred)) return preferred;
  if (languages.some((lang) => lang.code === fallback)) return fallback;
  return languages[0]?.code ?? fallback;
}

/**
 * Single-verse reader: scrolling content with a sticky verse-number grid on the right.
 * Language is controlled by the site header switcher.
 */
export function VerseReader({
  chapterNumber,
  verses,
  languages,
  initialLanguage = "en",
}: VerseReaderProps) {
  const t = useMessages();
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const [mounted, setMounted] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [bookmark, setBookmark] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const articleRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => setMounted(true), []);

  const language = resolveLanguage(
    mounted ? preferredLanguage : initialLanguage,
    languages,
    initialLanguage,
  );

  const verse = verses[index] ?? null;
  const verseNumbers = verses.map((v) => v.number);

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
  const commentary = verse ? pickCommentary(verse, language) : null;
  const wordMeanings = verse ? pickWordMeanings(verse, language) : null;
  const shloka = verse
    ? shlokaInLanguage(verse.sanskritText, language, verse.transliteration)
    : null;
  const showDevanagariAside =
    verse != null && language === "en" && verse.sanskritText.trim().length > 0;
  const showIastAside =
    verse != null &&
    (language === "sa" || language === "hi") &&
    Boolean(verse.transliteration?.trim());

  function goToIndex(nextIndex: number) {
    setIndex(nextIndex);
    setBookmark(false);
    window.requestAnimationFrame(() => {
      articleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function goToVerseNumber(n: number) {
    const found = verses.findIndex((v) => v.number === n);
    if (found >= 0) goToIndex(found);
  }

  async function copyVerse() {
    if (!verse) return;
    const text = [
      verse.publicId,
      shlokaInLanguage(verse.sanskritText, language, verse.transliteration),
      translation,
      commentary,
      wordMeanings,
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

  if (verses.length === 0) {
    return (
      <section className="border-border rounded-xl border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No published verses in chapter {chapterNumber} yet.
        </p>
      </section>
    );
  }

  const grid = (
    <div className="border-border bg-card/60 rounded-xl border p-4 shadow-xs">
      <VerseNumberGrid
        verseNumbers={verseNumbers}
        currentNumber={verse?.number ?? 0}
        onSelect={goToVerseNumber}
        label={t.jumpToVerse}
        compact
      />
    </div>
  );

  return (
    <section
      id="reader"
      aria-labelledby="reader-heading"
      className="scroll-mt-24"
    >
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-8">
        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={index === 0}
              onClick={() => goToIndex(index - 1)}
              className="min-w-[7rem] justify-start"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              {t.previousVerse}
            </Button>

            <h2
              id="reader-heading"
              className="font-serif text-center text-lg tracking-tight sm:text-xl"
            >
              {t.chapterFallback(chapterNumber)}, {t.verseSingular}{" "}
              {verse?.number ?? ""}
            </h2>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={index >= verses.length - 1}
              onClick={() => goToIndex(index + 1)}
              className="min-w-[7rem] justify-end"
            >
              {t.nextVerse}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          {verse ? (
            <article
              ref={articleRef}
              id={`verse-${verse.number}`}
              className="border-border bg-card animate-fade-up scroll-mt-28 rounded-xl border p-6 shadow-xs sm:p-8 lg:p-10"
              aria-label={`${t.verseSingular} ${verse.number}`}
            >
              <p className="text-muted-foreground font-mono text-[11px] tracking-wide">
                {verse.publicId}
              </p>

              <div className="mt-6 space-y-8 sm:mt-8 sm:space-y-10">
                <div className="border-border bg-muted/30 rounded-xl border px-5 py-6 sm:px-8 sm:py-8">
                  <p className="text-sanskrit font-serif text-xl leading-verse tracking-wide whitespace-pre-line sm:text-2xl md:text-[1.75rem]">
                    {shloka}
                  </p>
                  {showDevanagariAside ? (
                    <p className="text-muted-foreground mt-5 font-serif text-base leading-verse tracking-wide whitespace-pre-line sm:text-lg">
                      {verse.sanskritText}
                    </p>
                  ) : null}
                  {showIastAside ||
                  (isIndicScriptLanguage(language) && verse.transliteration) ? (
                    <p className="text-muted-foreground mt-4 text-sm italic leading-relaxed whitespace-pre-line">
                      {verse.transliteration}
                    </p>
                  ) : null}
                </div>

                {wordMeanings ? (
                  <WordMeaningList text={wordMeanings} label={t.meaning} />
                ) : null}

                <div>
                  <SectionHeading>
                    {language === "sa" ? t.sanskrit : t.translation}
                  </SectionHeading>
                  {translation ? (
                    <p className="text-verse text-base leading-relaxed whitespace-pre-line sm:text-lg">
                      {language === "sa" ? null : (
                        <span className="text-foreground mr-2 font-semibold">
                          BG {chapterNumber}.{verse.number}:
                        </span>
                      )}
                      {translation}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {language === "sa" ? t.noSanskrit : t.noTranslation}
                    </p>
                  )}
                </div>

                {COMMENTARY_LANGUAGES.has(language) ? (
                  <div>
                    <SectionHeading>{t.commentary}</SectionHeading>
                    {commentary ? (
                      <p className="text-verse text-base leading-relaxed whitespace-pre-line sm:text-lg">
                        {commentary}
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {t.noCommentary}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => goToIndex(index - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    {t.previousVerse}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index >= verses.length - 1}
                    onClick={() => goToIndex(index + 1)}
                  >
                    {t.nextVerse}
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void copyVerse()}
                  >
                    <Copy className="h-4 w-4" aria-hidden />
                    {copied ? t.copied : t.copy}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void shareVerse()}
                  >
                    <Share2 className="h-4 w-4" aria-hidden />
                    {t.share}
                  </Button>
                  <Button
                    type="button"
                    variant={bookmark ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setBookmark((v) => !v)}
                    aria-pressed={bookmark}
                  >
                    <Bookmark className="h-4 w-4" aria-hidden />
                    {bookmark ? t.bookmarked : t.bookmark}
                  </Button>
                </div>
              </div>
            </article>
          ) : null}

          {verse ? <RelatedReading versePublicId={verse.publicId} /> : null}

          {/* Mobile / tablet: grid below content */}
          <div className="lg:hidden">{grid}</div>
        </div>

        {/* Desktop: sticky right rail */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          {grid}
        </aside>
      </div>
    </section>
  );
}
