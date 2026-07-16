import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { AccessPayload } from "../auth/auth.service";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  ContentRevisionDto,
  UpdateTranslationDto,
  UpdateVerseDto,
  VerseResponseDto,
  VerseTranslationDto,
} from "./verses.dto";
import { VersesService, type VerseIncludeMode } from "./verses.service";

@ApiTags("verses")
@Controller("verses")
export class VersesController {
  constructor(private readonly versesService: VersesService) {}

  @Get()
  @Header(
    "Cache-Control",
    "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
  )
  @ApiOperation({ summary: "List verses for a chapter (published)" })
  async list(
    @Query("chapterPublicId") chapterPublicId: string,
    @Query("include") include: VerseIncludeMode = "reader",
  ): Promise<{
    data: VerseResponseDto[];
    meta: {
      languages: Array<{ code: string; name: string; nativeName: string | null }>;
    };
  }> {
    const result = await this.versesService.listByChapterPublicId(chapterPublicId, {
      publishedOnly: true,
      include,
    });
    return { data: result.data, meta: { languages: result.languages } };
  }

  @Patch("translations/:translationId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a translation row" })
  async updateTranslation(
    @Param("translationId", ParseUUIDPipe) translationId: string,
    @Body() body: UpdateTranslationDto,
    @CurrentUser() user: AccessPayload,
  ): Promise<{ data: VerseTranslationDto }> {
    const data = await this.versesService.updateTranslation(
      translationId,
      body,
      user.sub,
    );
    return { data };
  }

  @Get("by-id/:id/revisions")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List verse revision history" })
  async revisions(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<{ data: ContentRevisionDto[] }> {
    const data = await this.versesService.listRevisions(id);
    return { data };
  }

  @Patch("by-id/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a verse (CMS)" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateVerseDto,
    @CurrentUser() user: AccessPayload,
  ): Promise<{ data: VerseResponseDto }> {
    const data = await this.versesService.update(id, body, user.sub);
    return { data };
  }

  @Get("by-id/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get verse by internal id (CMS)" })
  async getById(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<{ data: VerseResponseDto }> {
    const data = await this.versesService.getById(id);
    return { data };
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Get a published verse by publicId" })
  @ApiOkResponse({ type: VerseResponseDto })
  async getByPublicId(
    @Param("publicId") publicId: string,
  ): Promise<{ data: VerseResponseDto }> {
    const data = await this.versesService.findPublishedByPublicId(publicId);
    return { data };
  }
}
