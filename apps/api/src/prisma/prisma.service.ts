import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const CONNECT_ATTEMPTS = 8;
const CONNECT_BASE_DELAY_MS = 750;

/** Neon pooler defaults: Prisma opens up to 9 connections unless capped. */
function withNeonPoolDefaults(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  if (!url.searchParams.has("connection_limit")) {
    url.searchParams.set(
      "connection_limit",
      process.env.NODE_ENV === "production" ? "5" : "3",
    );
  }
  if (!url.searchParams.has("pool_timeout")) {
    url.searchParams.set("pool_timeout", "30");
  }
  return url.toString();
}

function prismaErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "errorCode" in error &&
    typeof (error as { errorCode?: unknown }).errorCode === "string"
  ) {
    return (error as { errorCode: string }).errorCode;
  }
  return undefined;
}

/**
 * Thin wrapper around PrismaClient so it participates in Nest's lifecycle:
 * connect when the module boots, disconnect on shutdown. This is the ONLY
 * place the app talks to PostgreSQL — repositories/services will inject this.
 *
 * Retries on P1001/P1017/P2024 so Neon cold-starts and pool exhaustion don't crash boot.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const raw = process.env.DIVINE_DATABASE_URL;
    super(
      raw
        ? {
            datasources: {
              db: { url: withNeonPoolDefaults(raw) },
            },
          }
        : undefined,
    );
  }

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
        const code = prismaErrorCode(error);
        const retryable = code === "P1001" || code === "P1017" || code === "P2024";
        if (!retryable || attempt === CONNECT_ATTEMPTS) {
          break;
        }
        const delay = CONNECT_BASE_DELAY_MS * attempt;
        this.logger.warn(
          `Database connect failed (${code ?? "unknown"}); retry ${attempt}/${CONNECT_ATTEMPTS} in ${delay}ms`,
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
