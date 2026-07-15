import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ScripturesController } from "./scriptures.controller";
import { ScripturesService } from "./scriptures.service";

@Module({
  imports: [AuthModule],
  controllers: [ScripturesController],
  providers: [ScripturesService],
  exports: [ScripturesService],
})
export class ScripturesModule {}
