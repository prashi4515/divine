import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";

@ApiTags("media")
@Controller("media")
export class MediaController {
  private readonly uploadsDir = join(process.cwd(), "uploads", "media");

  @Get("files/:fileName")
  @ApiOperation({ summary: "Serve uploaded media files" })
  serve(@Param("fileName") fileName: string, @Res() res: Response): void {
    if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
      throw new NotFoundException("File not found");
    }
    const absolute = join(this.uploadsDir, fileName);
    if (!existsSync(absolute)) {
      throw new NotFoundException("File not found");
    }
    createReadStream(absolute).pipe(res);
  }
}
