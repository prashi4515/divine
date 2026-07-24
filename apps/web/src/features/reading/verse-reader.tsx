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
  devanagariToReadingScript,
  isIndicScriptLanguage,
  localizePadachedaLemmas,
  normalizeScriptProxyText,
  readingLanguageScheme,
  rescriptPadacheda,
  shlokaInLanguage,
} from "@/lib/reading/shloka-script";
import { isReadingLanguageCode } from "@/lib/reading/languages";
import {
  readerFontClass,
  shlokaFontClass,
} from "@/lib/reading/reader-fonts";
import { useReadingStore } from "@/lib/stores/reading-store";
import {
  fetchPublishedVerseClient,
  mergeVerseTranslations,
} from "@/lib/api/verse-detail-client";
import { cn } from "@/lib/utils";

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

/** Hindi meaning mechanically rewritten into kn/ta/ml script — not native. */
const SCRIPT_PROXY_SOURCES = new Set(["ramsukhdas-indic-script"]);

/** Vyakhya rows that are Hindi text in another script (interim). */
const SCRIPT_PROXY_VYAKHYA = new Set([
  "ramsukhdas-vyakhya-kn",
  "ramsukhdas-vyakhya-ta",
  "ramsukhdas-vyakhya-ml",
  "ramsukhdas-vyakhya-or",
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

type PickedText = { text: string; isFallback: boolean };

/** Strip corpus prefixes like "BG 1.16-18:" — the UI adds BG n.m itself. */
function formatTranslationText(text: string): string {
  return text
    .replace(/^\s*BG\s+\d+\.\d+(?:-\d+(?:\.\d+)?)?:\s*/i, "")
    .trim();
}

function pickTranslation(verse: Verse, language: string): PickedText | null {
  if (language === "sa") {
    return { text: verse.sanskritText, isFallback: false };
  }

  // Prefer a real native meaning (en / hi / te / or).
  const native = verse.translations.find(
    (t) =>
      t.languageCode === language &&
      !VYAKHYA_SOURCES.has(t.sourceKey) &&
      !W2W_SOURCES.has(t.sourceKey) &&
      !SCRIPT_PROXY_SOURCES.has(t.sourceKey),
  );
  if (native?.text) {
    return { text: formatTranslationText(native.text), isFallback: false };
  }

  // kn/ta/ml: re-letter Hindi meaning into the reader's script (clean nukta).
  if (language === "kn" || language === "ta" || language === "ml") {
    const hindi = verse.translations.find(
      (t) =>
        t.languageCode === "hi" &&
        !VYAKHYA_SOURCES.has(t.sourceKey) &&
        !W2W_SOURCES.has(t.sourceKey) &&
        !SCRIPT_PROXY_SOURCES.has(t.sourceKey),
    );
    if (hindi?.text) {
      return {
        text: formatTranslationText(
          cleanScriptProxyText(
            devanagariToReadingScript(hindi.text, language),
          ),
        ),
        isFallback: false,
      };
    }

    const scriptForm = verse.translations.find(
      (t) =>
        t.languageCode === language && SCRIPT_PROXY_SOURCES.has(t.sourceKey),
    );
    if (scriptForm?.text) {
      return {
        text: formatTranslationText(
          cleanScriptProxyText(normalizeScriptProxyText(scriptForm.text)),
        ),
        isFallback: false,
      };
    }
  }

  const english = verse.translations.find(
    (t) =>
      t.languageCode === "en" &&
      !VYAKHYA_SOURCES.has(t.sourceKey) &&
      !W2W_SOURCES.has(t.sourceKey),
  );
  if (english?.text && language === "en") {
    return { text: formatTranslationText(english.text), isFallback: false };
  }
  return null;
}

/** Drop Ramsukhdas footnote markers like "(टिप्पणी प0 1.2)" after script convert. */
function cleanScriptProxyText(text: string): string {
  return text
    .replace(/[（(]\s*टिप्पणी[^)）]*[)）]/gu, "")
    .replace(/[（(]\s*ಟಿಪ್ಪಣೀ[^)）]*[)）]/gu, "")
    .replace(/[（(]\s*டிப்பணீ[^)）]*[)）]/gu, "")
    .replace(/[（(]\s*ടിപ്പണീ[^)）]*[)）]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function pickWordMeanings(verse: Verse, language: string): string | null {
  const localized = verse.translations.find(
    (t) => t.languageCode === language && W2W_SOURCES.has(t.sourceKey),
  );
  if (localized?.text) return localized.text;

  const targetScheme = readingLanguageScheme(language);
  if (
    targetScheme &&
    targetScheme !== "iast" &&
    language !== "te" &&
    language !== "en"
  ) {
    const teluguW2w = verse.translations.find(
      (t) => t.languageCode === "te" && W2W_SOURCES.has(t.sourceKey),
    );
    if (teluguW2w?.text) {
      return rescriptPadacheda(teluguW2w.text, "telugu", targetScheme);
    }
  }

  const englishPadacheda = verse.meaning?.trim();
  if (!englishPadacheda) return null;
  if (language === "en" || language === "sa") {
    return englishPadacheda;
  }
  return localizePadachedaLemmas(englishPadacheda, language);
}

function pickCommentary(verse: Verse, language: string): PickedText | null {
  const native = verse.translations.find(
    (t) =>
      t.languageCode === language &&
      VYAKHYA_SOURCES.has(t.sourceKey) &&
      !SCRIPT_PROXY_VYAKHYA.has(t.sourceKey),
  );
  if (native?.text) return { text: native.text, isFallback: false };

  if (language === "kn" || language === "ta" || language === "ml" || language === "or") {
    const hindiVyakhya = verse.translations.find(
      (t) =>
        t.languageCode === "hi" && t.sourceKey === "ramsukhdas-vyakhya",
    );
    if (hindiVyakhya?.text) {
      return {
        text: cleanScriptProxyText(
          devanagariToReadingScript(hindiVyakhya.text, language),
        ),
        isFallback: false,
      };
    }

    const scriptVyakhya = verse.translations.find(
      (t) =>
        t.languageCode === language && SCRIPT_PROXY_VYAKHYA.has(t.sourceKey),
    );
    if (scriptVyakhya?.text) {
      return {
        text: cleanScriptProxyText(
          normalizeScriptProxyText(scriptVyakhya.text),
        ),
        isFallback: false,
      };
    }
  }

  if (language === "sa") {
    const hi = verse.translations.find(
      (t) => t.languageCode === "hi" && t.sourceKey === "ramsukhdas-vyakhya",
    );
    if (hi?.text) return { text: hi.text, isFallback: false };
  }

  const english = verse.commentary?.trim();
  if (english && language === "en") {
    return { text: english, isFallback: false };
  }
  return null;
}

function resolveLanguage(
  preferred: string,
  _languages: LanguageOption[],
  fallback: string,
): string {
  if (isReadingLanguageCode(preferred)) return preferred;
  if (isReadingLanguageCode(fallback)) return fallback;
  return "en";
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
  const [localVerses, setLocalVerses] = React.useState(verses);
  const [commentaryStatus, setCommentaryStatus] = React.useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const hydratedRef = React.useRef(new Set<string>());
  const articleRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    setLocalVerses(verses);
    hydratedRef.current.clear();
  }, [verses]);

  const language = resolveLanguage(
    mounted ? preferredLanguage : initialLanguage,
    languages,
    initialLanguage,
  );
  const bodyFont = readerFontClass(language);
  const shlokaFont = shlokaFontClass(language);

  const verse = localVerses[index] ?? null;
  const verseNumbers = localVerses.map((v) => v.number);

  React.useEffect(() => {
    const hash = window.location.hash.match(/^#verse-(\d+)$/);
    if (!hash) return;
    const n = Number.parseInt(hash[1]!, 10);
    const found = localVerses.findIndex((v) => v.number === n);
    if (found >= 0) setIndex(found);
  }, [localVerses]);

  React.useEffect(() => {
    if (!verse) return;
    const next = `#verse-${verse.number}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [verse]);

  /**
   * Slim chapter payloads omit vyakhya. Hydrate the active verse (and
   * prefetch neighbours) so commentary appears without blocking first paint.
   */
  React.useEffect(() => {
    const active = localVerses[index];
    if (!active) return;

    const neighborIds = [
      localVerses[index - 1]?.publicId,
      localVerses[index + 1]?.publicId,
    ].filter((id): id is string => Boolean(id));

    let cancelled = false;

    async function hydrate(publicId: string, isActive: boolean) {
      if (hydratedRef.current.has(publicId)) {
        if (isActive) setCommentaryStatus("ready");
        return;
      }
      if (isActive) setCommentaryStatus("loading");
      const full = await fetchPublishedVerseClient(publicId);
      if (cancelled) return;
      if (!full) {
        if (isActive) setCommentaryStatus("error");
        return;
      }
      hydratedRef.current.add(publicId);
      setLocalVerses((prevVerses) =>
        prevVerses.map((row) =>
          row.publicId === publicId
            ? mergeVerseTranslations(row, full)
            : row,
        ),
      );
      if (isActive) setCommentaryStatus("ready");
    }

    void hydrate(active.publicId, true);
    for (const id of neighborIds) void hydrate(id, false);

    return () => {
      cancelled = true;
    };
    // Intentionally omit localVerses: neighbors are snapshotted from this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, localVerses[index]?.publicId]);

  const translation = verse ? pickTranslation(verse, language) : null;
  const commentary = verse ? pickCommentary(verse, language) : null;
  const wordMeanings = verse ? pickWordMeanings(verse, language) : null;
  const shloka = verse
    ? shlokaInLanguage(verse.sanskritText, language, verse.transliteration)
    : null;
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
    const found = localVerses.findIndex((v) => v.number === n);
    if (found >= 0) goToIndex(found);
  }

  async function copyVerse() {
    if (!verse) return;
    const text = [
      verse.publicId,
      shlokaInLanguage(verse.sanskritText, language, verse.transliteration),
      translation?.text,
      commentary?.text,
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
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: verse.publicId,
          text: translation?.text ?? verse.sanskritText,
          url,
        });
        return;
      }
    } catch (error: unknown) {
      // User dismissed the system share sheet — not an application error.
      const name =
        error instanceof DOMException
          ? error.name
          : error instanceof Error
            ? error.name
            : "";
      if (name === "AbortError" || name === "NotAllowedError") return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; ignore quietly.
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

  const grid = (
    <div className="border-border/80 bg-card relative overflow-hidden rounded-2xl border p-4 shadow-sm">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, hsl(var(--saffron)), hsl(var(--gold)))",
        }}
        aria-hidden
      />
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
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-8">
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
              className={cn(
                "text-center text-lg tracking-tight sm:text-xl",
                bodyFont,
              )}
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
              className="border-border/80 bg-card animate-fade-up scroll-mt-28 rounded-2xl border p-5 shadow-sm sm:p-8 lg:p-10"
              aria-label={`${t.verseSingular} ${verse.number}`}
            >
              <div className="relative">
                <p className="text-maroon font-mono text-[11px] tracking-wide">
                  {verse.publicId}
                </p>
                <div className="absolute top-0 right-0 flex gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-saffron hover:text-maroon h-8 w-8 px-0"
                    onClick={() => void copyVerse()}
                    aria-label={copied ? t.copied : t.copy}
                  >
                    <Copy className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-saffron hover:text-maroon h-8 w-8 px-0"
                    onClick={() => void shareVerse()}
                    aria-label={t.share}
                  >
                    <Share2 className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-saffron hover:text-maroon h-8 w-8 px-0"
                    onClick={() => setBookmark((v) => !v)}
                    aria-label={bookmark ? t.bookmarked : t.bookmark}
                    aria-pressed={bookmark}
                  >
                    <Bookmark className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>

              <div className="mt-6 space-y-8 sm:mt-8 sm:space-y-10">
                <div className="mx-auto w-full max-w-4xl px-1 text-center sm:px-2">
                  {language === "en" ? (
                    <>
                      <p
                        className={cn(
                          "text-sanskrit text-2xl font-semibold leading-verse tracking-wide whitespace-pre-line sm:text-3xl md:text-[2rem]",
                          shlokaFont,
                        )}
                      >
                        {verse.sanskritText}
                      </p>
                      {verse.transliteration?.trim() ? (
                        <p
                          className={cn(
                            "text-muted-foreground mt-5 text-base italic leading-verse tracking-wide whitespace-pre-line sm:text-lg",
                            readerFontClass("en"),
                          )}
                        >
                          {verse.transliteration}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <p
                        className={cn(
                          "text-sanskrit text-2xl font-semibold leading-verse tracking-wide whitespace-pre-line sm:text-3xl md:text-[2rem]",
                          shlokaFont,
                        )}
                      >
                        {shloka}
                      </p>
                      {showIastAside ||
                      (isIndicScriptLanguage(language) &&
                        verse.transliteration) ? (
                        <p
                          className={cn(
                            "text-muted-foreground mt-5 text-base italic leading-verse tracking-wide whitespace-pre-line sm:text-lg",
                            readerFontClass("en"),
                          )}
                        >
                          {verse.transliteration}
                        </p>
                      ) : null}
                      {language !== "sa" &&
                      language !== "hi" &&
                      verse.sanskritText.trim() &&
                      shloka !== verse.sanskritText ? (
                        <p
                          className={cn(
                            "text-muted-foreground mt-4 text-sm leading-verse tracking-wide whitespace-pre-line sm:text-base",
                            shlokaFontClass("sa"),
                          )}
                        >
                          {verse.sanskritText}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>

                {wordMeanings ? (
                  <div className={bodyFont}>
                    <WordMeaningList
                      key={verse.publicId}
                      text={wordMeanings}
                      label={t.meaning}
                    />
                  </div>
                ) : null}

                <div>
                  <SectionHeading>
                    {language === "sa" ? t.sanskrit : t.translation}
                  </SectionHeading>
                  {translation ? (
                    <p
                      className={cn(
                        "text-verse text-base leading-verse whitespace-pre-line sm:text-lg",
                        bodyFont,
                      )}
                    >
                      {language === "sa" ? null : (
                        <span className="text-foreground mr-2 font-semibold">
                          BG {chapterNumber}.{verse.number}:
                        </span>
                      )}
                      {translation.text}
                    </p>
                  ) : (
                    <p className={cn("text-muted-foreground text-sm", bodyFont)}>
                      {language === "sa" ? t.noSanskrit : t.noTranslation}
                    </p>
                  )}
                </div>

                {COMMENTARY_LANGUAGES.has(language) ? (
                  <div>
                    <SectionHeading>{t.commentary}</SectionHeading>
                    {commentary ? (
                      <p
                        className={cn(
                          "text-verse text-base leading-verse whitespace-pre-line sm:text-lg",
                          bodyFont,
                        )}
                      >
                        {commentary.text}
                      </p>
                    ) : commentaryStatus === "loading" ? (
                      <p
                        className={cn(
                          "text-muted-foreground animate-pulse text-sm",
                          bodyFont,
                        )}
                      >
                        …
                      </p>
                    ) : (
                      <p
                        className={cn(
                          "text-muted-foreground text-sm",
                          bodyFont,
                        )}
                      >
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
                <div className="flex flex-wrap gap-2 sm:hidden">
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

          <div className="lg:hidden">{grid}</div>
        </div>

        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          {grid}
        </aside>
      </div>
    </section>
  );
}
