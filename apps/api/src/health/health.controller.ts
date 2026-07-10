import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Liveness/readiness endpoint for load balancers, uptime monitors, and Docker
 * healthchecks. Verifies the process is up AND that the database answers.
 * Deliberately placed at /health (outside the /v1 prefix) so infra can hit a
 * stable path that never changes with API versioning.
 */
@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.db.pingCheck("database", this.prisma)]);
  }
}
