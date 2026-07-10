import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";

/**
 * Terminus provides the health-check orchestration and the Prisma indicator.
 * PrismaService is available globally (PrismaModule), so no import needed here.
 */
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
