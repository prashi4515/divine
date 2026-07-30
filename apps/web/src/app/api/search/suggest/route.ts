import { NextResponse } from "next/server";
import type { SearchSuggestion } from "@divine/types";
import { formatGitaVerseLabel } from "@/lib/reading/verse-label";
import { staticSearchVerses } from "@/lib/search/static-verse-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOPIC_HINTS = [
  "karma",
  "dharma",
  "bhakti",
  "jnana",
  "mind",
  "meditation",
  "soul",
  "death",
  "duty",
  "detachment",
  "peace",
  "yoga",
] as const;

/**
 * Instant autocomplete from the static verse index (no Nest/Neon).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(12, Math.max(1, Number(url.searchParams.get("limit") || 8)));

  if (q.length < 1) {
    return NextResponse.json({ data: [] satisfies SearchSuggestion[] });
  }

  const suggestions: SearchSuggestion[] = [];
  const seen = new Set<string>();
  const push = (item: SearchSuggestion) => {
    const key = `${item.kind}:${item.text.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push(item);
  };

  const lower = q.toLowerCase();
  for (const topic of TOPIC_HINTS) {
    if (topic.startsWith(lower) || lower.startsWith(topic.slice(0, 3))) {
      push({
        text: topic,
        kind: "topic",
        href: `/search?topic=${encodeURIComponent(topic)}`,
      });
    }
  }

  // Verse refs like 2.47 / bg.2.47
  const ref = q.match(/^(?:bg\.)?(\d{1,2})\.(\d{1,3})$/i);
  if (ref) {
    const chapter = Number(ref[1]);
    const verse = Number(ref[2]);
    if (chapter >= 1 && chapter <= 18) {
      push({
        text: formatGitaVerseLabel(chapter, verse),
        kind: "verse",
        href: `/search?q=${encodeURIComponent(q)}`,
      });
    }
  }

  const results = await staticSearchVerses({
    q,
    lang: "en",
    page: 1,
    pageSize: Math.min(limit, 6),
  });

  for (const hit of results.data) {
    push({
      text: formatGitaVerseLabel(hit.chapterNumber, hit.verseNumber),
      kind: "verse",
      href: `/search?q=${encodeURIComponent(q)}`,
    });
    if (suggestions.length >= limit) break;
  }

  for (const term of results.meta.expandedTerms) {
    if (term.toLowerCase() === lower) continue;
    push({
      text: term,
      kind: "synonym",
      href: `/search?q=${encodeURIComponent(term)}`,
    });
    if (suggestions.length >= limit) break;
  }

  return NextResponse.json({ data: suggestions.slice(0, limit) });
}
