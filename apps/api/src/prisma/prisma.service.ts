import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const CONNECT_ATTEMPTS = 8;
const CONNECT_BASE_DELAY_MS = 750;

/**
 * Thin wrapper around PrismaClient so it participates in Nest's lifecycle:
 * connect when the module boots, disconnect on shutdown. This is the ONLY
 * place the app talks to PostgreSQL — repositories/services will inject this.
 *
 * Retries on P1001 so Neon cold-starts / brief pooler blips don't crash boot.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= CONNECT_ATTEMPTS; attempt++) {
      try {
        await this.$connect();
        if (attempt > 1) {
          this.logger.log(`Database connected after ${attempt} attempts`);
        }
        return;
      } catch (error: unknown) {
        lastError = error;
        const code =
          typeof error === "object" &&
          error !== null &&
          "errorCode" in error &&
          typeof (error as { errorCode?: unknown }).errorCode === "string"
            ? (error as { errorCode: string }).errorCode
            : undefined;
        const retryable = code === "P1001" || code === "P1017";
        if (!retryable || attempt === CONNECT_ATTEMPTS) {
          break;
        }
        const delay = CONNECT_BASE_DELAY_MS * attempt;
        this.logger.warn(
          `Database unreachable (${code ?? "unknown"}); retry ${attempt}/${CONNECT_ATTEMPTS} in ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
