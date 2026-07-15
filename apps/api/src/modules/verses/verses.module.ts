import { Module } from "@nestjs/common";
import { VersesController } from "./verses.controller";
import { VersesService } from "./verses.service";

@Module({
  controllers: [VersesController],
  providers: [VersesService],
  exports: [VersesService],
})
export class VersesModule {}
