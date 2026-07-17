"use client";

import * as React from "react";
import Link from "next/link";
import {
  relatedContentResponseSchema,
  type SearchTopicChip,
  type RelatedVerse,
} from "@divine/types";
import { TopicChip } from "./topic-chip";

type RelatedReadingProps = {
  versePublicId: string;
};

type RelatedState = {
  relatedVerses: RelatedVerse[];
  relatedTopics: SearchTopicChip[];
  peopleAlsoRead: RelatedVerse[];
};

/**
 * Related Verses / Topics / People also read — shown on the verse reader.
 * Fetches from the search service (same engine as /search).
 */
export function RelatedReading({ versePublicId }: RelatedReadingProps) {
  const [data, setData] = React.useState<RelatedState | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_DIVINE_API_URL?.replace(/\/$/, "");
    if (!base) return;

    void fetch(
      `${base}/v1/search/related/${encodeURIComponent(versePublicId)}`,
      { headers: { Accept: "application/json" } },
    )
      .then(async (res) => {
        if (!res.ok) return null;
        const json: unknown = await res.json();
        return relatedContentResponseSchema.parse(json).data;
      })
      .then((parsed) => {
        if (!cancelled && parsed) setData(parsed);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [versePublicId]);

  if (!data) return null;
  const empty =
    data.relatedVerses.length === 0 &&
    data.relatedTopics.length === 0 &&
    data.peopleAlsoRead.length === 0;
  if (empty) return null;

  return (
    <aside className="border-border/60 mt-10 space-y-8 border-t pt-8">
      {data.relatedTopics.length > 0 ? (
        <section>
          <h2 className="font-serif text-lg tracking-tight">Related Topics</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.relatedTopics.map((t) => (
              <TopicChip
                key={t.slug}
                slug={t.slug}
                name={t.name}
                href={`/search?topic=${encodeURIComponent(t.slug)}`}
              />
            ))}
          </div>
        </section>
      ) : null}

      {data.relatedVerses.length > 0 ? (
        <section>
          <h2 className="font-serif text-lg tracking-tight">Related Verses</h2>
          <ul className="mt-3 space-y-3">
            {data.relatedVerses.map((v) => (
              <li key={v.publicId}>
                <Link
                  href={v.href}
                  className="hover:text-foreground text-muted-foreground block text-sm leading-relaxed transition-divine"
                >
                  <span className="text-foreground font-medium">
                    {v.publicId}
                  </span>
                  <span className="mt-0.5 block">{v.preview}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data.peopleAlsoRead.length > 0 ? (
        <section>
          <h2 className="font-serif text-lg tracking-tight">People also read</h2>
          <ul className="mt-3 space-y-3">
            {data.peopleAlsoRead.map((v) => (
              <li key={v.publicId}>
                <Link
                  href={v.href}
                  className="hover:text-foreground text-muted-foreground block text-sm leading-relaxed transition-divine"
                >
                  <span className="text-foreground font-medium">
                    {v.publicId}
                  </span>
                  <span className="mt-0.5 block">{v.preview}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
