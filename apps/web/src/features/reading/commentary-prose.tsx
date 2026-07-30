import { cn } from "@/lib/utils";
import { splitReadingParagraphs } from "@/lib/reading/split-reading-paragraphs";

type CommentaryProseProps = {
  text: string;
  versePublicId: string;
  lang?: string;
  className?: string;
  /** Shown above the body when commentary is a language fallback. */
  fallbackNote?: string | null;
};

/**
 * Commentary as a quiet reading column — lead paragraph, spaced stanzas,
 * and a soft saffron rule (not a card wall of plain text).
 */
export function CommentaryProse({
  text,
  versePublicId,
  lang,
  className,
  fallbackNote,
}: CommentaryProseProps) {
  const paragraphs = splitReadingParagraphs(text);

  return (
    <div className={cn("commentary-prose", className)}>
      {fallbackNote ? (
        <p className="text-muted-foreground mb-4 text-xs tracking-wide">
          {fallbackNote}
        </p>
      ) : null}

      <div
        lang={lang}
        className="border-saffron/25 relative border-l-2 pl-5 pr-6 sm:pl-7 sm:pr-8"
      >
        <span
          className="text-saffron/35 pointer-events-none absolute -left-px top-0 select-none font-serif text-3xl leading-none"
          aria-hidden
        >
          ❝
        </span>

        {paragraphs.map((para, i) => (
          <div key={`${versePublicId}-c-${i}`}>
            {i === 1 ? (
              <div
                className="my-6 flex items-center gap-3 sm:my-7"
                aria-hidden
              >
                <span className="bg-border/80 h-px flex-1" />
                <span className="text-saffron/45 font-serif text-sm leading-none">
                  ॐ
                </span>
                <span className="bg-border/80 h-px flex-1" />
              </div>
            ) : i > 1 ? (
              <div className="bg-border/60 mx-auto my-5 h-px w-16 sm:my-6" aria-hidden />
            ) : null}
            <p
              className={cn(
                "text-reading whitespace-pre-line",
                i === 0 && "commentary-lead",
              )}
            >
              {para}
            </p>
          </div>
        ))}

        <span
          className="text-saffron/35 pointer-events-none absolute bottom-0 right-0 select-none font-serif text-3xl leading-none"
          aria-hidden
        >
          ❞
        </span>
      </div>
    </div>
  );
}
