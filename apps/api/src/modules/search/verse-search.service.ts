import { Inject, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { normalizeSearchQuery } from "./engine/query-normalize";
import {
  SEARCH_ENGINE,
  type SearchEngine,
  type VerseSearchPage,
  type VerseSearchQuery,
} from "./engine/search-engine";

@Injectable()
export class VerseSearchService {
  private readonly logger = new Logger(VerseSearchService.name);

  constructor(
    @Inject(SEARCH_ENGINE) private readonly engine: SearchEngine,
    private readonly prisma: PrismaService,
  ) {}

  search(query: VerseSearchQuery): Promise<VerseSearchPage> {
    return this.engine.searchVerses(query);
  }

  suggest(q: string, limit?: number) {
    return this.engine.suggest({ q, limit });
  }

  related(versePublicId: string) {
    return this.engine.related(versePublicId);
  }

  async recordSearch(input: {
    query: string;
    resultCount: number;
    userId?: string | null;
    sessionKey?: string | null;
  }): Promise<void> {
    const query = input.query.trim().slice(0, 255);
    if (!query) return;
    const normalized = normalizeSearchQuery(query);
    if (!normalized) return;

    try {
      await this.prisma.searchHistory.create({
        data: {
          query,
          resultCount: input.resultCount,
          userId: input.userId ?? null,
          sessionKey: input.sessionKey?.slice(0, 64) ?? null,
        },
      });

      await this.prisma.searchQueryStat.upsert({
        where: { queryNormalized: normalized },
        create: {
          queryNormalized: normalized,
          displayQuery: query,
          hitCount: 1,
          lastSearchedAt: new Date(),
        },
        update: {
          hitCount: { increment: 1 },
          lastSearchedAt: new Date(),
          displayQuery: query,
        },
      });
    } catch (error: unknown) {
      this.logger.warn(
        {
          err: error instanceof Error ? error.message : String(error),
        },
        "Failed to record search history",
      );
    }
  }

  async recent(input: {
    userId?: string | null;
    sessionKey?: string | null;
    limit?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 10, 1), 30);
    const where =
      input.userId != null
        ? { userId: input.userId }
        : input.sessionKey
          ? { sessionKey: input.sessionKey }
          : null;

    if (!where) return [];

    const rows = await this.prisma.searchHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit * 3,
    });

    const seen = new Set<string>();
    const out: Array<{ query: string; createdAt: string }> = [];
    for (const row of rows) {
      const key = normalizeSearchQuery(row.query);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ query: row.query, createdAt: row.createdAt.toISOString() });
      if (out.length >= limit) break;
    }
    return out;
  }

  async trending(limit = 10) {
    const take = Math.min(Math.max(limit, 1), 30);
    const rows = await this.prisma.searchQueryStat.findMany({
      orderBy: [{ hitCount: "desc" }, { lastSearchedAt: "desc" }],
      take,
    });
    return rows.map((r) => ({
      query: r.displayQuery,
      hitCount: r.hitCount,
    }));
  }
}
