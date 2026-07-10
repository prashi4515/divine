/**
 * Standalone connection verifier for the Neon PostgreSQL database.
 *
 * Run:  pnpm --filter @divine/api verify:db
 * It reads DIVINE_DATABASE_URL from apps/api/.env (loaded by node --env-file),
 * opens a real Prisma connection, and runs `SELECT version()`.
 *
 * SECURITY: the connection string password is never printed — only the
 * protocol/user/host/database are shown (masked).
 */
import { PrismaClient } from "@prisma/client";

function maskUrl(raw: string | undefined): string {
  if (!raw) return "(unset)";
  try {
    const u = new URL(raw);
    const auth = u.username ? `${u.username}:****@` : "";
    return `${u.protocol}//${auth}${u.host}${u.pathname}`;
  } catch {
    return "(unparseable connection string)";
  }
}

async function main(): Promise<void> {
  const url = process.env.DIVINE_DATABASE_URL;
  console.log(`[verify-db] Target: ${maskUrl(url)}`);

  if (!url) {
    console.error(
      "[verify-db] DIVINE_DATABASE_URL is not set. Create apps/api/.env from .env.example first.",
    );
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const startedAt = Date.now();
    const rows = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    const elapsedMs = Date.now() - startedAt;

    console.log(`[verify-db] Connected in ${elapsedMs}ms`);
    console.log(`[verify-db] Server: ${rows[0]?.version ?? "unknown"}`);
    console.log("[verify-db] OK — connection verified.");
  } catch (error) {
    console.error(
      "[verify-db] FAILED:",
      error instanceof Error ? error.message : String(error),
    );
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
