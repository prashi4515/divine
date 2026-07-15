import { Badge } from "@/components/ui/badge";

type ReaderPreviewProps = {
  chapterNumber: number;
};

/**
 * Elegant mock of the upcoming verse reader.
 * Replace this component with the real reader once verses are imported.
 */
export function ReaderPreview({ chapterNumber }: ReaderPreviewProps) {
  return (
    <section
      id="reader-preview"
      aria-labelledby="reader-preview-heading"
      className="scroll-mt-24"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="reader-preview-heading"
            className="font-serif text-xl tracking-tight sm:text-2xl"
          >
            Reader Preview
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg text-sm leading-relaxed">
            The full reader will automatically activate once verses are imported.
          </p>
        </div>
        <Badge variant="muted" className="tracking-wide">
          Preview
        </Badge>
      </div>

      <article
        className="border-border bg-card animate-fade-up rounded-xl border p-6 shadow-xs sm:p-10"
        aria-label={`Preview of verse 1 in chapter ${chapterNumber}`}
      >
        <p className="text-muted-foreground font-mono text-[11px] tracking-wide">
          bg.{chapterNumber}.1
        </p>
        <p className="text-muted-foreground mt-3 text-xs uppercase tracking-[0.18em]">
          Verse 1
        </p>

        <div className="mt-8 space-y-8">
          <div>
            <p className="text-muted-foreground mb-3 text-xs uppercase tracking-[0.14em]">
              Sanskrit
            </p>
            <p className="text-sanskrit font-serif text-xl leading-verse tracking-wide sm:text-2xl">
              संस्कृत श्लोक यहाँ प्रकट होगा ।
            </p>
            <p className="text-muted-foreground mt-3 text-sm italic leading-relaxed">
              Authentic Devanagari arrives with the verse import.
            </p>
          </div>

          <div>
            <p className="text-muted-foreground mb-3 text-xs uppercase tracking-[0.14em]">
              English Translation
            </p>
            <p className="text-verse text-base leading-relaxed sm:text-lg">
              The English rendering of this verse will appear here — clear, calm, and
              set for unhurried reading.
            </p>
          </div>

          <div>
            <p className="text-muted-foreground mb-3 text-xs uppercase tracking-[0.14em]">
              Meaning
            </p>
            <p className="text-verse-muted text-sm leading-relaxed sm:text-base">
              A short reflection on the verse will sit beneath the translation, offering
              context without interrupting the flow of the text.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
