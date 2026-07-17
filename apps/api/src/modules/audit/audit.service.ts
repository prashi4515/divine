import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export type AuditWriteInput = {
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async write(input: AuditWriteInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: input.userId ?? null,
          action: input.action,
          entityType: input.entityType ?? null,
          entityId: input.entityId ?? null,
          ip: input.ip ?? null,
          userAgent: input.userAgent ?? null,
          metadata:
            input.metadata === undefined || input.metadata === null
              ? undefined
              : (input.metadata as Prisma.InputJsonValue),
        },
      });
    } catch (error: unknown) {
      // Never fail the primary request because audit write failed.
      this.logger.error(
        `Audit write failed for action=${input.action}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
