import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterHero } from "@/features/reading/chapter-hero";
import { ChapterReaderHeader } from "@/features/reading/chapter-reader-header";
import { VerseReaderClient } from "@/features/reading/verse-reader-client";
import { RelatedEntitiesRail } from "@/features/encyclopedia/related-entities-rail";
import { SiteFooter } from "@/features/reading/site-footer";
import { gitaChapterTitle } from "@/lib/i18n/gita-chapters";
import { getStaticGitaChapter } from "@/lib/reading/gita-static";
import { getEntitiesForGitaChapter } from "@/lib/knowledge/store";

type ChapterPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Fully static Gita chapters — HTML from slim `content/gita/reader/*.json`.
 * Commentaries load from `/api/gita/commentary/*` (on-disk, ~30–50ms, no Neon).
 */
export const dynamic = "force-static";
export const revalidate = false;

export function generateStaticParams() {
  return Array.from({ length: 18 }, (_, index) => ({
    slug: `chapter-${index + 1}`,
  }));
}

const CHAPTER_SLUG = /^chapter-(\d+)$/;

function parseChapterNumber(slug: string): number | null {
  const match = CHAPTER_SLUG.exec(slug);
  if (!match) return null;
  const n = Number.parseInt(match[1]!, 10);
  if (!Number.isFinite(n) || n < 1 || n > 18) return null;
  return n;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const n = parseChapterNumber(slug);
  if (n === null) return { title: "Chapter" };

  const title = gitaChapterTitle("en", n);
  return {
    title: `Chapter ${n} — ${title}`,
    description: `Read Chapter ${n} of the Bhagavad Gita — ${title}. A calm, typography-first reading experience.`,
    alternates: {
      canonical: `/bhagavad-gita/chapter-${n}`,
    },
  };
}

const LANGUAGE_ORDER = [
  "en",
  "sa",
  "hi",
  "te",
  "kn",
  "ta",
  "ml",
  "or",
] as const;

function orderLanguages(
  languages: Array<{ code: string; name: string; nativeName: string | null }>,
) {
  const byCode = new Map(languages.map((l) => [l.code, l]));
  const ordered = LANGUAGE_ORDER.map((code) => byCode.get(code)).filter(
    (l): l is { code: string; name: string; nativeName: string | null } =>
      Boolean(l),
  );
  for (const lang of languages) {
    if (!LANGUAGE_ORDER.includes(lang.code as (typeof LANGUAGE_ORDER)[number])) {
      ordered.push(lang);
    }
  }
  return ordered;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const n = parseChapterNumber(slug);
  if (n === null) notFound();

  let snapshot;
  try {
    snapshot = await getStaticGitaChapter(n);
  } catch {
    notFound();
  }

  const readerLanguages = orderLanguages(snapshot.languages);
  const relatedEntities = await getEntitiesForGitaChapter(n).catch(() => []);

  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 90% 45% at 50% -8%, hsl(var(--saffron) / 0.12), transparent 55%),
            radial-gradient(ellipse 55% 35% at 90% 10%, hsl(var(--gold) / 0.08), transparent 55%),
            hsl(var(--background))
          `,
        }}
      />

      <ChapterReaderHeader />

      <main className="page-gutter w-full max-w-none flex-1 pb-14 pt-6 sm:pb-16 md:pb-20 md:pt-8">
        <VerseReaderClient
          chapterNumber={snapshot.chapter.number}
          verses={snapshot.verses}
          languages={readerLanguages}
          initialLanguage="en"
          hero={
            <ChapterHero
              number={snapshot.chapter.number}
              title={snapshot.chapter.title}
              verseCount={snapshot.chapter.verseCount}
              workTitle={snapshot.chapter.work.title}
              workCode={snapshot.chapter.work.code}
              align="center"
            />
          }
        />
        <RelatedEntitiesRail
          entities={relatedEntities}
          chapterNumber={n}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
