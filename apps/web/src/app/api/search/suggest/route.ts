import { NextResponse } from "next/server";
import type { SearchSuggestion } from "@divine/types";
import { suggestKnowledge } from "@/lib/search/knowledge-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOPIC_HINTS = [
  "karma",
  "dharma",
  "bhakti",
  "jnana",
  "krishna",
  "arjuna",
  "kurukshetra",
  "hastinapura",
  "pandavas",
  "yoga",
] as const;

/**
 * Instant autocomplete from the static Knowledge Search index (no Neon).
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
        href: `/search?q=${encodeURIComponent(topic)}`,
      });
    }
  }

  try {
    const hits = await suggestKnowledge(q, limit);
    for (const hit of hits) {
      push({
        text: hit.text,
        kind: hit.kind,
        href: hit.href,
        ...(hit.entityKind ? { entityKind: hit.entityKind } : {}),
      });
      if (suggestions.length >= limit) break;
    }
  } catch {
    // Index may be missing in fresh checkouts before generate:search-index
  }

  return NextResponse.json({ data: suggestions.slice(0, limit) });
}
