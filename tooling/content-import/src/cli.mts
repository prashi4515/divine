#!/usr/bin/env node
/**
 * CLI — divine-import
 *
 * Usage:
 *   pnpm --filter @divine/content-import load -- --file ./fixtures/example.v1.json --dry-run
 *   pnpm --filter @divine/content-import load -- --file ./path.json
 *
 * Env: loads apps/api/.env via package.json script (--env-file).
 * Requires DIVINE_DATABASE_URL (and DIVINE_DIRECT_URL for migrations; import uses pooled URL).
 */

import { resolve } from "node:path";
import { runImport } from "./pipeline.mts";
import { createConsoleProgress } from "./reporter/report.mts";

interface CliArgs {
  file: string | null;
  dryRun: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { file: null, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--") continue;
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--file" || a === "-f") {
      args.file = argv[++i] ?? null;
    } else if (a?.startsWith("--file=")) {
      args.file = a.slice("--file=".length);
    }
  }
  return args;
}

function printHelp(): void {
  process.stdout.write(`
Divine Content Import

Usage:
  divine-import --file <path.json> [--dry-run]

Options:
  -f, --file <path>   Path to a schemaVersion 1.0.0 JSON catalog
  --dry-run           Parse + validate only; no database writes
  -h, --help          Show this help

Exit codes:
  0  success (including successful dry-run)
  1  parse / validation / import failure
`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.file) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  const filePath = resolve(process.cwd(), args.file);
  const { exitCode } = await runImport({
    filePath,
    dryRun: args.dryRun,
    onProgress: createConsoleProgress(),
  });
  process.exit(exitCode);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Fatal: ${message}\n`);
  process.exit(1);
});
