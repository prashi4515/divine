/**
 * Global Knowledge Search over the build-time static index
 * (`content/search/knowledge-index.json`). No Neon.
 */

import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import {
  KNOWLEDGE_SEARCH_GROUP_LABELS,
  KNOWLEDGE_SEARCH_GROUPS,
  knowledgeSearchIndexSchema,
  type KnowledgeSearchDocument,
  type KnowledgeSearchGroup,
  type KnowledgeSearchGroupBucket,
  type KnowledgeSearchHit,
  type KnowledgeSearchResponse,
} from "@divine/types";

const INDEX_PATH_CANDIDATES = [
  path.join(process.cwd(), "content", "search", "knowledge-index.json"),
  path.join(
    process.cwd(),
    "apps",
    "web",
    "content",
    "search",
    "knowledge-index.json",
  ),
];

async function resolveIndexPath(): Promise<string> {
  for (const candidate of INDEX_PATH_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }
  throw new Error(
    `[knowledge-search] knowledge-index.json not found (looked in ${INDEX_PATH_CANDIDATES.join(", ")})`,
  );
}

let cache: Promise<readonly KnowledgeSearchDocument[]> | null = null;

export function foldDiacritics(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasDevanagari(s: string): boolean {
  return /\p{Script=Devanagari}/u.test(s);
}

/** Bounded Levenshtein — returns Infinity if distance would exceed maxDist. */
function editDistance(a: string, b: string, maxDist: number): number {
  if (Math.abs(a.length - b.length) > maxDist) return Number.POSITIVE_INFINITY;
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    let rowMin = curr[0]!;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      const v = Math.min(
        (prev[j] ?? 0) + 1,
        (curr[j - 1] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost,
      );
      curr[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > maxDist) return Number.POSITIVE_INFINITY;
    [prev, curr] = [curr, prev];
  }
  return prev[n] ?? Number.POSITIVE_INFINITY;
}

function fuzzyTokenScore(needle: string, hay: string): number {
  if (needle.length < 3 || hay.length < 3) return 0;
  const maxDist = needle.length <= 4 ? 1 : needle.length <= 8 ? 2 : 3;
  const tokens = hay.split(/\s+/).filter((t) => t.length >= 3);
  let best = 0;
  for (const t of tokens) {
    if (Math.abs(t.length - needle.length) > maxDist) continue;
    const d = editDistance(needle, t, maxDist);
    if (d === 0) return 4;
    if (d === 1) best = Math.max(best, 2.5);
    else if (d === 2) best = Math.max(best, 1.5);
    else if (d <= maxDist) best = Math.max(best, 0.8);
  }
  // Also try contiguous substrings of similar length in long haystacks
  if (best === 0 && hay.length <= 80) {
    const d = editDistance(needle, hay.slice(0, needle.length + maxDist), maxDist);
    if (d <= maxDist) best = Math.max(best, 1);
  }
  return best;
}

type Scored = {
  doc: KnowledgeSearchDocument;
  score: number;
  matchedOn: string[];
};

function scoreDocument(
  doc: KnowledgeSearchDocument,
  query: string,
  qFold: string,
  tokens: string[],
  sanskritQuery: boolean,
): Scored | null {
  const matchedOn: string[] = [];
  let score = 0;

  const titleFold = foldDiacritics(doc.title);
  const englishFold = foldDiacritics(doc.englishTitle);
  const aliasFolds = doc.aliases.map((a) => foldDiacritics(a));
  const idFold = foldDiacritics(doc.id.replace(/\./g, " "));

  // Exact / prefix / contains on primary fields
  const primary: Array<{ label: string; value: string; weight: number }> = [
    { label: "title", value: titleFold, weight: 12 },
    { label: "english", value: englishFold, weight: 10 },
    { label: "id", value: idFold, weight: 11 },
    ...aliasFolds.map((value) => ({
      label: "alias",
      value,
      weight: 9,
    })),
  ];

  for (const p of primary) {
    if (!p.value) continue;
    if (p.value === qFold) {
      score += p.weight;
      matchedOn.push(p.label);
    } else if (p.value.startsWith(qFold) && qFold.length >= 2) {
      score += p.weight * 0.7;
      matchedOn.push(p.label);
    } else if (p.value.includes(qFold) && qFold.length >= 2) {
      score += p.weight * 0.45;
      matchedOn.push(p.label);
    }
  }

  // Full haystack (Latin-folded)
  if (qFold.length >= 2 && doc.searchText.includes(qFold)) {
    score += 2.5;
    matchedOn.push("text");
  }

  // Sanskrit / raw (Devanagari or IAST as typed)
  const qLower = query.toLowerCase();
  if (sanskritQuery || /[āīūṛṝḷḹṅñṭḍṇśṣḥṃ]/i.test(query)) {
    if (doc.searchTextRaw.includes(qLower)) {
      score += 8;
      matchedOn.push("sanskrit");
    }
    if (doc.sanskrit?.includes(query) || doc.sanskrit?.includes(qLower)) {
      score += 10;
      matchedOn.push("sanskrit");
    }
    if (doc.iast && foldDiacritics(doc.iast).includes(qFold)) {
      score += 6;
      matchedOn.push("iast");
    }
  } else if (doc.searchTextRaw.includes(qLower) && qLower.length >= 3) {
    score += 3;
    matchedOn.push("raw");
  }

  // Multi-token: require most tokens to hit for a boost
  if (tokens.length > 1) {
    let hits = 0;
    for (const t of tokens) {
      if (doc.searchText.includes(t) || doc.searchTextRaw.includes(t)) hits += 1;
    }
    if (hits === tokens.length) score += 4;
    else if (hits >= Math.ceil(tokens.length * 0.6)) score += 1.5;
    else if (hits === 0 && score === 0) return null;
  }

  // Fuzzy (aliases + titles) when exact path was weak
  if (score < 6 && qFold.length >= 3) {
    const fuzzyFields = [titleFold, englishFold, ...aliasFolds];
    let fuzzy = 0;
    for (const field of fuzzyFields) {
      fuzzy = Math.max(fuzzy, fuzzyTokenScore(qFold, field));
    }
    if (fuzzy > 0) {
      score += fuzzy;
      matchedOn.push("fuzzy");
    }
  }

  if (score <= 0) return null;

  // Importance boost (1–5)
  score += doc.importance * 0.35;

  // Surface richness slight boost
  score += Math.min(doc.surfaces.length, 3) * 0.15;

  return {
    doc,
    score,
    matchedOn: [...new Set(matchedOn)],
  };
}

async function loadDocuments(): Promise<readonly KnowledgeSearchDocument[]> {
  if (!cache) {
    cache = (async () => {
      const indexPath = await resolveIndexPath();
      const raw = await fs.readFile(indexPath, "utf8");
      const parsed = knowledgeSearchIndexSchema.parse(JSON.parse(raw));
      return parsed.documents ?? [];
    })().catch((err: unknown) => {
      cache = null;
      throw err;
    });
  }
  return cache;
}

export async function warmKnowledgeSearchIndex(): Promise<void> {
  await loadDocuments();
}

export type KnowledgeSearchParams = {
  q: string;
  group?: KnowledgeSearchGroup;
  perGroup?: number;
  limit?: number;
};

export async function searchKnowledge(
  params: KnowledgeSearchParams,
): Promise<KnowledgeSearchResponse> {
  const started = Date.now();
  const q = params.q.trim();
  const perGroup = Math.min(24, Math.max(1, params.perGroup ?? 8));
  const docs = await loadDocuments();

  if (!q) {
    return {
      data: { groups: [], total: 0 },
      meta: { query: "", tookMs: Date.now() - started },
    };
  }

  const qFold = foldDiacritics(q);
  const tokens = qFold.split(/\s+/).filter((t) => t.length >= 2);
  const sanskritQuery = hasDevanagari(q);

  const pool = params.group
    ? docs.filter((d) => d.group === params.group)
    : docs;

  const scored: Scored[] = [];
  for (const doc of pool) {
    const hit = scoreDocument(doc, q, qFold, tokens, sanskritQuery);
    if (hit) scored.push(hit);
  }
  scored.sort((a, b) => b.score - a.score || b.doc.importance - a.doc.importance);

  const byGroup = new Map<KnowledgeSearchGroup, Scored[]>();
  for (const g of KNOWLEDGE_SEARCH_GROUPS) byGroup.set(g, []);

  for (const s of scored) {
    const list = byGroup.get(s.doc.group);
    if (!list) continue;
    list.push(s);
  }

  const groups: KnowledgeSearchGroupBucket[] = [];
  let total = 0;

  for (const g of KNOWLEDGE_SEARCH_GROUPS) {
    const all = byGroup.get(g) ?? [];
    if (all.length === 0) continue;
    total += all.length;
    const hits: KnowledgeSearchHit[] = all.slice(0, perGroup).map((s) => ({
      ...s.doc,
      score: Math.round(s.score * 100) / 100,
      matchedOn: s.matchedOn,
    }));
    groups.push({
      group: g,
      label: KNOWLEDGE_SEARCH_GROUP_LABELS[g],
      hits,
      total: all.length,
    });
  }

  // Optional global cap across groups (keep group structure)
  if (params.limit && params.limit > 0) {
    let remaining = params.limit;
    for (const bucket of groups) {
      if (remaining <= 0) {
        bucket.hits = [];
        continue;
      }
      if (bucket.hits.length > remaining) {
        bucket.hits = bucket.hits.slice(0, remaining);
      }
      remaining -= bucket.hits.length;
    }
  }

  return {
    data: {
      groups: groups.filter((g) => g.hits.length > 0),
      total,
    },
    meta: {
      query: q,
      tookMs: Date.now() - started,
    },
  };
}

/** Lightweight suggest chips from the same index. */
export async function suggestKnowledge(
  query: string,
  limit = 8,
): Promise<
  Array<{
    text: string;
    kind: "entity" | "verse" | "query";
    href: string;
    entityKind?: string;
    score: number;
  }>
> {
  const res = await searchKnowledge({
    q: query,
    perGroup: 3,
    limit: limit + 4,
  });
  const flat = res.data.groups.flatMap((g) =>
    g.hits.map((h) => ({
      text: h.title,
      kind: (h.group === "verses" ? "verse" : "entity") as "entity" | "verse",
      href: `/search?q=${encodeURIComponent(query)}`,
      entityKind:
        h.group === "verses"
          ? "Verse"
          : KNOWLEDGE_SEARCH_GROUP_LABELS[h.group],
      score: h.score,
    })),
  );
  return flat.sort((a, b) => b.score - a.score).slice(0, limit);
}
