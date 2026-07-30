import { NextResponse } from "next/server";
import {
  KNOWLEDGE_SEARCH_GROUPS,
  knowledgeSearchResponseSchema,
  type KnowledgeSearchGroup,
} from "@divine/types";
import { searchKnowledge } from "@/lib/search/knowledge-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Global Knowledge Search — static JSON index only (no Neon).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const groupParam = url.searchParams.get("group");
  const perGroup = Math.min(
    24,
    Math.max(1, Number(url.searchParams.get("perGroup") || 8)),
  );

  let group: KnowledgeSearchGroup | undefined;
  if (
    groupParam &&
    (KNOWLEDGE_SEARCH_GROUPS as readonly string[]).includes(groupParam)
  ) {
    group = groupParam as KnowledgeSearchGroup;
  }

  if (!q) {
    return NextResponse.json(
      knowledgeSearchResponseSchema.parse({
        data: { groups: [], total: 0 },
        meta: { query: "", tookMs: 0 },
      }),
    );
  }

  try {
    const result = await searchKnowledge({ q, group, perGroup });
    return NextResponse.json(knowledgeSearchResponseSchema.parse(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search index unavailable";
    return NextResponse.json(
      { error: message, data: { groups: [], total: 0 }, meta: { query: q, tookMs: 0 } },
      { status: 503 },
    );
  }
}
