import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request } from "express";
import type { AccessPayload } from "../auth/auth.service";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";
import { VerseSearchService } from "./verse-search.service";

@ApiTags("search")
@Controller("search")
export class PublicSearchController {
  constructor(private readonly verseSearch: VerseSearchService) {}

  @Get("verses")
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: "Intelligent multilingual verse search (public)" })
  async searchVerses(
    @Query("q") q = "",
    @Query("page") page = "1",
    @Query("pageSize") pageSize = "20",
    @Query("topic") topic?: string,
    @Query("lang") lang?: string,
    @Query("work") work?: string,
  ) {
    const result = await this.verseSearch.search({
      q,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
      topic: topic?.trim() || undefined,
      language: lang?.trim() || undefined,
      workCode: work?.trim() || "bg",
    });

    const totalPages =
      result.pageSize > 0 ? Math.ceil(result.total / result.pageSize) : 0;

    return {
      data: result.hits,
      meta: {
        query: result.query,
        expandedTerms: result.expandedTerms,
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages,
      },
    };
  }

  @Get("suggest")
  @Throttle({ default: { limit: 90, ttl: 60_000 } })
  @ApiOperation({ summary: "Autocomplete suggestions" })
  async suggest(@Query("q") q = "", @Query("limit") limit = "8") {
    const data = await this.verseSearch.suggest(q, Number(limit) || 8);
    return { data };
  }

  @Get("trending")
  @ApiOperation({ summary: "Trending search queries" })
  async trending(@Query("limit") limit = "10") {
    const data = await this.verseSearch.trending(Number(limit) || 10);
    return { data };
  }

  @Get("recent")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Recent searches for user or session" })
  async recent(
    @Req() req: Request & { user?: AccessPayload | null },
    @Headers("x-search-session") sessionKey?: string,
    @Query("limit") limit = "10",
  ) {
    const data = await this.verseSearch.recent({
      userId: req.user?.sub ?? null,
      sessionKey: sessionKey ?? null,
      limit: Number(limit) || 10,
    });
    return { data };
  }

  @Post("history")
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  @ApiOperation({ summary: "Record a search for history + trending" })
  async recordHistory(
    @Req() req: Request & { user?: AccessPayload | null },
    @Headers("x-search-session") sessionKey: string | undefined,
    @Body()
    body: { query?: string; resultCount?: number },
  ) {
    await this.verseSearch.recordSearch({
      query: body.query ?? "",
      resultCount: body.resultCount ?? 0,
      userId: req.user?.sub ?? null,
      sessionKey: sessionKey ?? null,
    });
    return { ok: true };
  }

  @Get("related/:publicId")
  @ApiOperation({ summary: "Related verses, topics, and people also read" })
  async related(@Param("publicId") publicId: string) {
    const data = await this.verseSearch.related(decodeURIComponent(publicId));
    return { data };
  }
}
