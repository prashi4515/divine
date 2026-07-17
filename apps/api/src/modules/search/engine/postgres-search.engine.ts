import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import {
  expandWithBuiltins,
  isWorkAliasOnly,
  normalizeSearchQuery,
  tokenizeQuery,
} from "./query-normalize";
import type {
  RelatedContent,
  SearchEngine,
  SearchSuggestionHit,
  SuggestQuery,
  VerseSearchHit,
  VerseSearchPage,
  VerseSearchQuery,
} from "./search-engine";

type ScoredId = { id: string; score: number; matched: string[] };

const PREVIEW_LEN = 160;

@Injectable()
export class PostgresSearchEngine implements SearchEngine {
  private readonly logger = new Logger(PostgresSearchEngine.name);

  constructor(private readonly prisma: PrismaService) {}

  async searchVerses(query: VerseSearchQuery): Promise<VerseSearchPage> {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(Math.max(query.pageSize || 20, 1), 50);
    const workCode = query.workCode ?? "bg";
    const language = query.language ?? "en";
    const normalized = normalizeSearchQuery(query.q);

    if (!normalized && !query.topic) {
      return {
        hits: [],
        total: 0,
        expandedTerms: [],
        query: query.q.trim(),
        page,
        pageSize,
      };
    }

    const expanded = await this.expandTerms(normalized);
    const workBrowse = isWorkAliasOnly(normalized);

    try {
      const scored = workBrowse
        ? await this.scoreAllPublished(workCode, query.topic)
        : await this.scoreCandidates(expanded, workCode, query.topic, language);

      scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
      const total = scored.length;
      const slice = scored.slice((page - 1) * pageSize, page * pageSize);
      const hits = await this.hydrateHits(slice, language, workCode);

      return {
        hits,
        total,
        expandedTerms: expanded.slice(0, 24),
        query: query.q.trim(),
        page,
        pageSize,
      };
    } catch (error: unknown) {
      this.logger.error(
        { err: error instanceof Error ? error.message : String(error) },
        "Postgres search failed",
      );
      throw error;
    }
  }

  async suggest(query: SuggestQuery): Promise<SearchSuggestionHit[]> {
    const normalized = normalizeSearchQuery(query.q);
    if (normalized.length < 1) return [];
    const limit = Math.min(Math.max(query.limit ?? 8, 1), 20);
    const workCode = query.workCode ?? "bg";
    const scored: Array<SearchSuggestionHit & { rank: number }> = [];
    const seen = new Set<string>();

    const push = (hit: SearchSuggestionHit, rank: number) => {
      const key = `${hit.kind}:${hit.text.toLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);
      scored.push({ ...hit, rank });
    };

    const [terms, topics, verses, stats] = await Promise.all([
      this.prisma.searchTerm.findMany({
        where: {
          OR: [
            { term: { startsWith: normalized, mode: "insensitive" } },
            { term: { contains: normalized, mode: "insensitive" } },
            { canonical: { startsWith: normalized, mode: "insensitive" } },
            { canonical: { contains: normalized, mode: "insensitive" } },
          ],
        },
        take: limit * 2,
        orderBy: { weight: "desc" },
      }),
      this.prisma.topic.findMany({
        where: {
          isPublished: true,
          OR: [
            { name: { startsWith: normalized, mode: "insensitive" } },
            { name: { contains: normalized, mode: "insensitive" } },
            { slug: { startsWith: normalized, mode: "insensitive" } },
          ],
        },
        take: 6,
        orderBy: { sortOrder: "asc" },
      }),
      this.prisma.verse.findMany({
        where: {
          isPublished: true,
          chapter: { work: { code: workCode } },
          OR: [
            { publicId: { startsWith: normalized, mode: "insensitive" } },
            { publicId: { contains: normalized, mode: "insensitive" } },
            { transliteration: { contains: normalized, mode: "insensitive" } },
          ],
        },
        take: 5,
        include: { chapter: true },
        orderBy: [{ chapter: { number: "asc" } }, { number: "asc" }],
      }),
      this.prisma.searchQueryStat.findMany({
        where: {
          OR: [
            { queryNormalized: { startsWith: normalized } },
            { displayQuery: { contains: normalized, mode: "insensitive" } },
          ],
        },
        orderBy: { hitCount: "desc" },
        take: 5,
      }),
    ]);

    for (const s of stats) {
      const starts = s.queryNormalized.startsWith(normalized) ? 0 : 2;
      push(
        {
          text: s.displayQuery,
          kind: "query",
          href: `/search?q=${encodeURIComponent(s.displayQuery)}`,
        },
        starts,
      );
    }

    for (const t of terms) {
      const starts = t.term.toLowerCase().startsWith(normalized) ? 1 : 3;
      push(
        {
          text: t.term,
          kind: t.kind === "synonym" ? "synonym" : "query",
          href: `/search?q=${encodeURIComponent(t.canonical)}`,
        },
        starts,
      );
      if (t.canonical !== t.term) {
        push(
          {
            text: t.canonical,
            kind: "query",
            href: `/search?q=${encodeURIComponent(t.canonical)}`,
          },
          t.canonical.toLowerCase().startsWith(normalized) ? 1 : 4,
        );
      }
    }

    for (const topic of topics) {
      push(
        {
          text: topic.name,
          kind: "topic",
          href: `/search?topic=${encodeURIComponent(topic.slug)}`,
        },
        topic.name.toLowerCase().startsWith(normalized) ? 2 : 5,
      );
    }

    for (const v of verses) {
      push(
        {
          text: v.publicId,
          kind: "verse",
          href: `/bhagavad-gita/chapter-${v.chapter.number}#verse-${v.number}`,
        },
        v.publicId.toLowerCase().startsWith(normalized) ? 2 : 6,
      );
    }

    for (const b of expandWithBuiltins(normalized)) {
      if (!b.toLowerCase().includes(normalized)) continue;
      push(
        {
          text: b,
          kind: "query",
          href: `/search?q=${encodeURIComponent(b)}`,
        },
        b.toLowerCase().startsWith(normalized) ? 2 : 7,
      );
    }

    scored.sort((a, b) => a.rank - b.rank || a.text.localeCompare(b.text));
    return scored.slice(0, limit).map(({ rank: _r, ...hit }) => hit);
  }

  async related(versePublicId: string): Promise<RelatedContent> {
    const verse = await this.prisma.verse.findFirst({
      where: { publicId: versePublicId, isPublished: true },
      include: {
        chapter: true,
        verseTopics: { include: { topic: true } },
        searchKeywords: { take: 12, orderBy: { weight: "desc" } },
      },
    });

    if (!verse) {
      return { relatedVerses: [], relatedTopics: [], peopleAlsoRead: [] };
    }

    const topicIds = verse.verseTopics.map((vt) => vt.topicId);
    const relatedTopics = verse.verseTopics
      .filter((vt) => vt.topic.isPublished)
      .map((vt) => ({ slug: vt.topic.slug, name: vt.topic.name }));

    const relatedByTopic =
      topicIds.length === 0
        ? []
        : await this.prisma.verseTopic.findMany({
            where: {
              topicId: { in: topicIds },
              verseId: { not: verse.id },
              verse: { isPublished: true },
            },
            include: {
              verse: {
                include: {
                  chapter: true,
                  verseTopics: { include: { topic: true } },
                  translations: {
                    where: {
                      isPublished: true,
                      language: { code: "en" },
                    },
                    take: 1,
                  },
                },
              },
            },
            take: 40,
          });

    const byId = new Map<string, (typeof relatedByTopic)[number]["verse"]>();
    for (const row of relatedByTopic) {
      if (!byId.has(row.verse.id)) byId.set(row.verse.id, row.verse);
    }

    const relatedVerses = [...byId.values()].slice(0, 6).map((v) => ({
      publicId: v.publicId,
      href: `/bhagavad-gita/chapter-${v.chapter.number}#verse-${v.number}`,
      preview: previewText(
        v.translations[0]?.text ?? v.meaning ?? v.sanskritText,
      ),
      topics: v.verseTopics
        .filter((vt) => vt.topic.isPublished)
        .map((vt) => ({ slug: vt.topic.slug, name: vt.topic.name })),
      reason: "topic" as const,
    }));

    // Adjacent + same-chapter verses as "people also read" until engagement exists
    const neighbors = await this.prisma.verse.findMany({
      where: {
        isPublished: true,
        chapterId: verse.chapterId,
        id: { not: verse.id },
      },
      include: {
        chapter: true,
        verseTopics: { include: { topic: true } },
        translations: {
          where: { isPublished: true, language: { code: "en" } },
          take: 1,
        },
      },
      orderBy: { number: "asc" },
      take: 8,
    });

    const peopleAlsoRead = neighbors
      .filter((v) => Math.abs(v.number - verse.number) <= 3)
      .slice(0, 4)
      .map((v) => ({
        publicId: v.publicId,
        href: `/bhagavad-gita/chapter-${v.chapter.number}#verse-${v.number}`,
        preview: previewText(
          v.translations[0]?.text ?? v.meaning ?? v.sanskritText,
        ),
        topics: v.verseTopics
          .filter((vt) => vt.topic.isPublished)
          .map((vt) => ({ slug: vt.topic.slug, name: vt.topic.name })),
        reason: "people_also_read" as const,
      }));

    return { relatedVerses, relatedTopics, peopleAlsoRead };
  }

  private async expandTerms(normalized: string): Promise<string[]> {
    const builtin = expandWithBuiltins(normalized);
    const tokens = tokenizeQuery(normalized);
    const lookup = [...new Set([normalized, ...tokens, ...builtin])].filter(
      (t) => t.length >= 2 || /[\u0900-\u097f\u0c00-\u0c7f]/.test(t),
    );

    if (lookup.length === 0) return builtin;

    const dbTerms = await this.prisma.searchTerm.findMany({
      where: {
        OR: lookup.flatMap((t) => [
          { term: { equals: t, mode: "insensitive" as const } },
          { canonical: { equals: t, mode: "insensitive" as const } },
          { term: { contains: t, mode: "insensitive" as const } },
        ]),
      },
      take: 80,
    });

    const out = new Set(builtin);
    for (const row of dbTerms) {
      out.add(normalizeSearchQuery(row.term));
      out.add(normalizeSearchQuery(row.canonical));
    }

    // Fuzzy term match via pg_trgm when available
    try {
      const fuzzy = await this.prisma.$queryRaw<
        Array<{ term: string; canonical: string }>
      >`
        SELECT term, canonical
        FROM search_terms
        WHERE similarity(term, ${normalized}) > 0.35
           OR similarity(canonical, ${normalized}) > 0.35
        ORDER BY GREATEST(similarity(term, ${normalized}), similarity(canonical, ${normalized})) DESC
        LIMIT 20
      `;
      for (const row of fuzzy) {
        out.add(normalizeSearchQuery(row.term));
        out.add(normalizeSearchQuery(row.canonical));
      }
    } catch {
      // Extension may be unavailable in some environments — ILIKE path still works
    }

    return [...out].filter(Boolean);
  }

  private async scoreAllPublished(
    workCode: string,
    topicSlug?: string,
  ): Promise<ScoredId[]> {
    const verses = await this.prisma.verse.findMany({
      where: {
        isPublished: true,
        chapter: { work: { code: workCode } },
        ...(topicSlug
          ? { verseTopics: { some: { topic: { slug: topicSlug } } } }
          : {}),
      },
      select: { id: true, chapter: { select: { number: true } }, number: true },
      orderBy: [{ chapter: { number: "asc" } }, { number: "asc" }],
    });
    return verses.map((v, i) => ({
      id: v.id,
      score: Math.max(1, 100 - i * 0.01),
      matched: ["bhagavad gita"],
    }));
  }

  private async scoreCandidates(
    terms: string[],
    workCode: string,
    topicSlug: string | undefined,
    language: string,
  ): Promise<ScoredId[]> {
    const searchTerms = terms
      .filter((t) => t.length >= 2 || /[\u0900-\u097f\u0c00-\u0c7f]/.test(t))
      .slice(0, 8);

    if (searchTerms.length === 0 && !topicSlug) return [];

    const scores = new Map<string, ScoredId>();

    const bump = (id: string, points: number, matched: string) => {
      const prev = scores.get(id);
      if (prev) {
        prev.score += points;
        if (!prev.matched.includes(matched)) prev.matched.push(matched);
      } else {
        scores.set(id, { id, score: points, matched: [matched] });
      }
    };

    const termResults = await Promise.all(
      searchTerms.map(async (term) => {
        const verses = await this.prisma.verse.findMany({
          where: {
            isPublished: true,
            chapter: { work: { code: workCode } },
            ...(topicSlug
              ? { verseTopics: { some: { topic: { slug: topicSlug } } } }
              : {}),
            OR: [
              { publicId: { contains: term, mode: "insensitive" } },
              { sanskritText: { contains: term, mode: "insensitive" } },
              { transliteration: { contains: term, mode: "insensitive" } },
              { meaning: { contains: term, mode: "insensitive" } },
              {
                translations: {
                  some: {
                    isPublished: true,
                    text: { contains: term, mode: "insensitive" },
                  },
                },
              },
              {
                searchKeywords: {
                  some: { keyword: { contains: term, mode: "insensitive" } },
                },
              },
              {
                verseTopics: {
                  some: {
                    topic: {
                      OR: [
                        { name: { contains: term, mode: "insensitive" } },
                        { slug: { contains: term, mode: "insensitive" } },
                      ],
                    },
                  },
                },
              },
            ],
          },
          select: {
            id: true,
            publicId: true,
            meaning: true,
            transliteration: true,
            sanskritText: true,
          },
          take: 80,
        });
        return { term, verses };
      }),
    );

    for (const { term, verses } of termResults) {
      for (const v of verses) {
        let points = 4;
        const hay = [
          v.publicId,
          v.transliteration ?? "",
          v.meaning ?? "",
          v.sanskritText,
        ]
          .join("\n")
          .toLowerCase();
        if (v.publicId.toLowerCase().includes(term)) points += 12;
        if ((v.transliteration ?? "").toLowerCase().includes(term)) points += 8;
        if ((v.meaning ?? "").toLowerCase().includes(term)) points += 6;
        if (hay.includes(term)) points += 2;
        bump(v.id, points, term);
      }
    }

    // Trigram fuzzy pass for misspellings not caught by expansion
    if (searchTerms.length > 0) {
      try {
        const primary = searchTerms[0]!;
        const fuzzyRows = await this.prisma.$queryRaw<Array<{ id: string }>>`
          SELECT v.id
          FROM verses v
          INNER JOIN chapters c ON c.id = v.chapter_id
          INNER JOIN works w ON w.id = c.work_id
          WHERE v.is_published = true
            AND w.code = ${workCode}
            AND (
              similarity(COALESCE(v.transliteration, ''), ${primary}) > 0.25
              OR similarity(COALESCE(v.meaning, ''), ${primary}) > 0.2
              OR similarity(v.public_id, ${primary}) > 0.35
            )
          LIMIT 80
        `;
        for (const row of fuzzyRows) {
          bump(row.id, 5, primary);
        }
      } catch {
        // ignore if pg_trgm unavailable
      }
    }

    // Topic-only browse
    if (topicSlug && scores.size === 0) {
      const topicVerses = await this.prisma.verse.findMany({
        where: {
          isPublished: true,
          chapter: { work: { code: workCode } },
          verseTopics: { some: { topic: { slug: topicSlug } } },
        },
        select: { id: true },
        take: 500,
      });
      for (const v of topicVerses) bump(v.id, 3, topicSlug);
    }

    void language;
    return [...scores.values()];
  }

  private async hydrateHits(
    scored: ScoredId[],
    language: string,
    workCode: string,
  ): Promise<VerseSearchHit[]> {
    if (scored.length === 0) return [];
    const ids = scored.map((s) => s.id);
    const scoreMap = new Map(scored.map((s) => [s.id, s]));

    const verses = await this.prisma.verse.findMany({
      where: { id: { in: ids } },
      include: {
        chapter: { include: { work: true } },
        verseTopics: { include: { topic: true } },
        translations: {
          where: {
            isPublished: true,
            language: { code: { in: [language, "en", "hi", "te", "sa"] } },
          },
          include: { language: true, translationSource: true },
        },
      },
    });

    const byId = new Map(verses.map((v) => [v.id, v]));
    const hits: VerseSearchHit[] = [];

    for (const id of ids) {
      const v = byId.get(id);
      const meta = scoreMap.get(id);
      if (!v || !meta) continue;
      if (v.chapter.work.code !== workCode) continue;

      const translation = pickTranslation(v.translations, language);
      const preview = previewText(
        translation?.text ?? v.meaning ?? v.sanskritText,
      );

      hits.push({
        publicId: v.publicId,
        chapterNumber: v.chapter.number,
        verseNumber: v.number,
        href: `/bhagavad-gita/chapter-${v.chapter.number}#verse-${v.number}`,
        sanskrit: v.sanskritText,
        transliteration: v.transliteration,
        translation: translation?.text
          ? formatTranslationText(translation.text)
          : v.meaning,
        preview,
        matchedKeywords: meta.matched.slice(0, 8),
        topics: v.verseTopics
          .filter((vt) => vt.topic.isPublished)
          .map((vt) => ({ slug: vt.topic.slug, name: vt.topic.name })),
        score: Math.round(meta.score * 10) / 10,
        languageCode: translation?.language.code ?? language,
      });
    }

    return hits;
  }
}

function previewText(text: string): string {
  const clean = formatTranslationText(text).replace(/\s+/g, " ").trim();
  if (clean.length <= PREVIEW_LEN) return clean;
  return `${clean.slice(0, PREVIEW_LEN - 1).trimEnd()}…`;
}

function formatTranslationText(text: string): string {
  return text
    .replace(/^\s*BG\s+\d+\.\d+(?:-\d+(?:\.\d+)?)?:\s*/i, "")
    .trim();
}

const VYAKHYA = new Set([
  "ramsukhdas-vyakhya",
  "ramsukhdas-vyakhya-kn",
  "ramsukhdas-vyakhya-ta",
  "ramsukhdas-vyakhya-ml",
  "ramsukhdas-vyakhya-or",
  "holy-bg-telugu-vyakhya",
]);
const W2W = new Set(["holy-bg-telugu-w2w"]);

function pickTranslation(
  translations: Array<{
    text: string;
    language: { code: string };
    translationSource: { key: string };
  }>,
  language: string,
): { text: string; language: { code: string } } | null {
  const preferred = translations.find(
    (t) =>
      t.language.code === language &&
      !VYAKHYA.has(t.translationSource.key) &&
      !W2W.has(t.translationSource.key),
  );
  if (preferred) return preferred;
  const en = translations.find(
    (t) =>
      t.language.code === "en" &&
      !VYAKHYA.has(t.translationSource.key) &&
      !W2W.has(t.translationSource.key),
  );
  return en ?? null;
}
