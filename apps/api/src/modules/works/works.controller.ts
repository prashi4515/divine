import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { WorksListResponseDto, WorkResponseDto } from "./works.dto";
import { WorksService } from "./works.service";

@ApiTags("works")
@Controller("works")
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get()
  @ApiOperation({
    summary: "List published works",
    description:
      "Returns all published scripture works ordered by sortOrder (ascending). No authentication required.",
  })
  @ApiOkResponse({ type: WorksListResponseDto })
  async list(): Promise<WorksListResponseDto> {
    const data: WorkResponseDto[] = await this.worksService.findPublished();
    return { data };
  }
}
