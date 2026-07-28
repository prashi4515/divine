"use client";

import dynamic from "next/dynamic";
import type { Verse } from "@divine/types";

type LanguageOption = {
  code: string;
  name: string;
  nativeName: string | null;
};

type VerseReaderClientProps = {
  chapterNumber: number;
  verses: Verse[];
  languages: LanguageOption[];
  initialLanguage?: string;
};

/**
 * Dynamic client boundary for the chapter reader.
 * Avoids a Next.js SSG bug where a large client module is missing from the
 * React Client Manifest during static prerender of chapter pages.
 */
const VerseReaderLazy = dynamic(
  () =>
    import("@/features/reading/verse-reader").then((mod) => mod.VerseReader),
  {
    ssr: true,
    loading: () => (
      <div
        className="animate-pulse space-y-4 py-6"
        aria-busy="true"
        aria-label="Loading verses"
      >
        <div className="bg-muted mx-auto h-8 w-2/3 max-w-xl rounded" />
        <div className="bg-muted mx-auto h-24 w-full max-w-3xl rounded-xl" />
        <div className="bg-muted mx-auto h-40 w-full max-w-3xl rounded-xl" />
      </div>
    ),
  },
);

export function VerseReaderClient(props: VerseReaderClientProps) {
  return <VerseReaderLazy {...props} />;
}
