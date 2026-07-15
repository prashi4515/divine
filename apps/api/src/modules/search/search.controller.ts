import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SearchService, type SearchHitDto } from "./search.service";

@ApiTags("search")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "Global CMS search across content entities" })
  async search(
    @Query("q") q = "",
    @Query("limit") limit = "20",
  ): Promise<{ data: SearchHitDto[] }> {
    const data = await this.searchService.search(q, Number(limit) || 20);
    return { data };
  }
}
