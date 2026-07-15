import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import {
  ChapterDetailResponseDto,
  ChaptersListResponseDto,
} from "./chapters.dto";
import { ChaptersService } from "./chapters.service";

@ApiTags("chapters")
@Controller("chapters")
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get()
  @ApiOperation({
    summary: "List published chapters",
    description:
      "Returns all published chapters ordered by sortOrder (ascending), each with a nested work summary. No authentication required.",
  })
  @ApiOkResponse({ type: ChaptersListResponseDto })
  async list(): Promise<ChaptersListResponseDto> {
    const data = await this.chaptersService.findPublished();
    return { data };
  }

  @Get(":publicId")
  @ApiOperation({
    summary: "Get a published chapter by public ID",
    description:
      'Returns one published chapter (e.g. "bg.1") with its work summary. Unpublished or unknown IDs return 404.',
  })
  @ApiParam({
    name: "publicId",
    example: "bg.1",
    description: "Stable public identity — {workCode}.{chapterNumber}",
  })
  @ApiOkResponse({ type: ChapterDetailResponseDto })
  @ApiNotFoundResponse({ description: "Chapter not found or unpublished" })
  async getByPublicId(
    @Param("publicId") publicId: string,
  ): Promise<ChapterDetailResponseDto> {
    const data = await this.chaptersService.findPublishedByPublicId(publicId);
    return { data };
  }
}
