import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  CreateMediaDto,
  CreateNodeDto,
  CreateScriptureDto,
  MediaAssetDto,
  ReorderNodesDto,
  ScriptureDetailResponseDto,
  ScriptureListResponseDto,
  ScriptureNodeDto,
  STRUCTURE_PRESETS,
  UpdateNodeDto,
  UpdateScriptureDto,
} from "./scriptures.dto";
import { ScripturesService } from "./scriptures.service";

@ApiTags("scriptures")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("scriptures")
export class ScripturesController {
  constructor(private readonly scripturesService: ScripturesService) {}

  @Get("presets/structure")
  @ApiOperation({ summary: "List structure type presets" })
  structurePresets() {
    return { data: STRUCTURE_PRESETS };
  }

  @Get()
  @ApiOperation({ summary: "List scriptures (paginated)" })
  @ApiOkResponse({ type: ScriptureListResponseDto })
  async list(
    @Query("page") page = "1",
    @Query("pageSize") pageSize = "20",
    @Query("search") search?: string,
    @Query("religion") religion?: string,
    @Query("published") published?: string,
    @Query("status") status?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortDir") sortDir?: string,
  ): Promise<ScriptureListResponseDto> {
    return this.scripturesService.list({
      page: Math.max(1, Number(page) || 1),
      pageSize: Math.min(100, Math.max(1, Number(pageSize) || 20)),
      search,
      religion,
      published:
        published === undefined ? undefined : published === "true" || published === "1",
      status,
      sortBy,
      sortDir: sortDir === "desc" ? "desc" : "asc",
    });
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: "Create a scripture" })
  @ApiOkResponse({ type: ScriptureDetailResponseDto })
  async create(@Body() body: CreateScriptureDto): Promise<ScriptureDetailResponseDto> {
    const data = await this.scripturesService.create(body);
    return { data };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get scripture by id" })
  @ApiOkResponse({ type: ScriptureDetailResponseDto })
  async get(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ScriptureDetailResponseDto> {
    const data = await this.scripturesService.getById(id);
    return { data };
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a scripture" })
  @ApiOkResponse({ type: ScriptureDetailResponseDto })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateScriptureDto,
  ): Promise<ScriptureDetailResponseDto> {
    const data = await this.scripturesService.update(id, body);
    return { data };
  }

  @Delete(":id")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete a scripture" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<{ data: null }> {
    await this.scripturesService.remove(id);
    return { data: null };
  }

  @Post(":id/publish")
  @HttpCode(200)
  @ApiOperation({ summary: "Publish scripture and linked catalog" })
  async publish(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ScriptureDetailResponseDto> {
    const data = await this.scripturesService.publish(id);
    return { data };
  }

  @Post(":id/unpublish")
  @HttpCode(200)
  @ApiOperation({ summary: "Unpublish scripture and linked catalog" })
  async unpublish(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ScriptureDetailResponseDto> {
    const data = await this.scripturesService.unpublish(id);
    return { data };
  }

  @Post(":id/archive")
  @HttpCode(200)
  @ApiOperation({ summary: "Archive scripture" })
  async archive(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ScriptureDetailResponseDto> {
    const data = await this.scripturesService.archive(id);
    return { data };
  }

  @Post(":id/review")
  @HttpCode(200)
  @ApiOperation({ summary: "Move scripture to review" })
  async review(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ScriptureDetailResponseDto> {
    const data = await this.scripturesService.setReview(id);
    return { data };
  }

  @Post(":id/duplicate")
  @HttpCode(200)
  @ApiOperation({ summary: "Duplicate scripture metadata and structure" })
  async duplicate(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ScriptureDetailResponseDto> {
    const data = await this.scripturesService.duplicate(id);
    return { data };
  }

  @Post(":id/sync-structure")
  @HttpCode(200)
  @ApiOperation({ summary: "Rebuild structure nodes from linked Work chapters" })
  async syncStructure(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<{ data: ScriptureNodeDto[] }> {
    const data = await this.scripturesService.syncStructureFromWork(id);
    return { data };
  }

  @Get(":id/catalog/chapters")
  @ApiOperation({ summary: "List linked Work chapters for CMS content editor" })
  async catalogChapters(@Param("id", ParseUUIDPipe) id: string) {
    const data = await this.scripturesService.listCatalogChapters(id);
    return { data };
  }

  @Get(":id/catalog/chapters/:chapterPublicId/verses")
  @ApiOperation({ summary: "List all verses for a linked chapter (CMS, includes drafts)" })
  async catalogVerses(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("chapterPublicId") chapterPublicId: string,
  ) {
    const data = await this.scripturesService.listCatalogVerses(id, chapterPublicId);
    return { data };
  }

  @Get(":id/nodes")
  @ApiOperation({ summary: "List structure tree" })
  async listNodes(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<{ data: ScriptureNodeDto[] }> {
    const data = await this.scripturesService.listNodes(id);
    return { data };
  }

  @Post(":id/nodes")
  @HttpCode(200)
  @ApiOperation({ summary: "Create a structure node" })
  async createNode(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: CreateNodeDto,
  ): Promise<{ data: ScriptureNodeDto }> {
    const data = await this.scripturesService.createNode(id, body);
    return { data };
  }

  @Patch(":id/nodes/:nodeId")
  @ApiOperation({ summary: "Update a structure node" })
  async updateNode(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("nodeId", ParseUUIDPipe) nodeId: string,
    @Body() body: UpdateNodeDto,
  ): Promise<{ data: ScriptureNodeDto }> {
    const data = await this.scripturesService.updateNode(id, nodeId, body);
    return { data };
  }

  @Delete(":id/nodes/:nodeId")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete a structure node" })
  async deleteNode(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("nodeId", ParseUUIDPipe) nodeId: string,
  ): Promise<{ data: null }> {
    await this.scripturesService.deleteNode(id, nodeId);
    return { data: null };
  }

  @Post(":id/nodes/reorder")
  @HttpCode(200)
  @ApiOperation({ summary: "Reorder sibling nodes" })
  async reorderNodes(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: ReorderNodesDto,
  ): Promise<{ data: ScriptureNodeDto[] }> {
    const data = await this.scripturesService.reorderNodes(id, body.orderedIds);
    return { data };
  }

  @Get(":id/media")
  @ApiOperation({ summary: "List media metadata for a scripture" })
  async listMedia(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<{ data: MediaAssetDto[] }> {
    const data = await this.scripturesService.listMedia(id);
    return { data };
  }

  @Post(":id/media")
  @HttpCode(200)
  @ApiOperation({ summary: "Upload / register media (data URLs are stored on disk)" })
  async createMedia(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: CreateMediaDto,
  ): Promise<{ data: MediaAssetDto }> {
    const data = await this.scripturesService.createMedia(id, body);
    return { data };
  }

  @Delete(":id/media/:mediaId")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete media metadata" })
  async deleteMedia(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("mediaId", ParseUUIDPipe) mediaId: string,
  ): Promise<{ data: null }> {
    await this.scripturesService.deleteMedia(id, mediaId);
    return { data: null };
  }
}
