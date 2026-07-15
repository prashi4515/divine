/**
 * Pipeline orchestrator — wires Parser → Validator → Importer → Reporter.
 *
 * Single entry for CLI and future programmatic callers (admin jobs, CI).
 */

import { PrismaClient } from "@prisma/client";
import { parseFile } from "./parser/parse-file.mts";
import { validateDocument } from "./validator/validate.mts";
import { importDocument } from "./importer/import.mts";
import {
  emptyCounts,
  formatSummary,
  type ImportSummary,
  type ProgressSink,
} from "./reporter/report.mts";
import type { Issue } from "./reporter/issues.mts";

export interface RunImportOptions {
  filePath: string;
  dryRun: boolean;
  prisma?: PrismaClient;
  onProgress?: ProgressSink;
  /** Print formatted summary to stdout (default true). */
  printSummary?: boolean;
}

export interface RunImportResult {
  summary: ImportSummary;
  exitCode: number;
}

function mergeIssues(...lists: Issue[][]): Issue[] {
  return lists.flat();
}

export async function runImport(options: RunImportOptions): Promise<RunImportResult> {
  const started = Date.now();
  const ownsPrisma = !options.prisma;
  const prisma = options.prisma ?? new PrismaClient();
  const onProgress = options.onProgress;
  const printSummary = options.printSummary ?? true;

  const baseSummary = (): ImportSummary => ({
    dryRun: options.dryRun,
    success: false,
    filePath: options.filePath,
    schemaVersion: null,
    workCode: null,
    durationMs: Date.now() - started,
    planned: emptyCounts(),
    written: emptyCounts(),
    issues: [],
  });

  try {
    onProgress?.({ phase: "parse", message: `Reading ${options.filePath}` });
    const parsed = await parseFile(options.filePath);
    if (!parsed.ok || !parsed.document) {
      const summary: ImportSummary = {
        ...baseSummary(),
        issues: parsed.issues.issues,
        durationMs: Date.now() - started,
      };
      if (printSummary) process.stdout.write(formatSummary(summary));
      return { summary, exitCode: 1 };
    }

    const doc = parsed.document;
    onProgress?.({
      phase: "validate",
      message: `Validating work "${doc.work.code}" (${doc.chapters.length} chapters)`,
    });

    const validated = await validateDocument(doc, {
      prisma,
      allowDbDuplicates: true,
    });

    if (!validated.ok) {
      const summary: ImportSummary = {
        ...baseSummary(),
        schemaVersion: doc.schemaVersion,
        workCode: doc.work.code,
        planned: validated.planned,
        issues: mergeIssues(parsed.issues.issues, validated.issues.issues),
        durationMs: Date.now() - started,
      };
      if (printSummary) process.stdout.write(formatSummary(summary));
      return { summary, exitCode: 1 };
    }

    if (options.dryRun) {
      onProgress?.({
        phase: "complete",
        message: "Dry run complete — no writes performed",
      });
      const summary: ImportSummary = {
        dryRun: true,
        success: true,
        filePath: options.filePath,
        schemaVersion: doc.schemaVersion,
        workCode: doc.work.code,
        durationMs: Date.now() - started,
        planned: validated.planned,
        written: emptyCounts(),
        issues: mergeIssues(parsed.issues.issues, validated.issues.issues),
      };
      if (printSummary) process.stdout.write(formatSummary(summary));
      return { summary, exitCode: 0 };
    }

    onProgress?.({ phase: "import", message: "Starting transactional import" });
    const imported = await importDocument(doc, { prisma, onProgress });

    const summary: ImportSummary = {
      dryRun: false,
      success: imported.ok,
      filePath: options.filePath,
      schemaVersion: doc.schemaVersion,
      workCode: doc.work.code,
      durationMs: Date.now() - started,
      planned: validated.planned,
      written: imported.written,
      issues: mergeIssues(
        parsed.issues.issues,
        validated.issues.issues,
        imported.issues.issues,
      ),
    };

    onProgress?.({
      phase: "complete",
      message: imported.ok ? "Import committed" : "Import failed — rolled back",
    });
    if (printSummary) process.stdout.write(formatSummary(summary));
    return { summary, exitCode: imported.ok ? 0 : 1 };
  } finally {
    if (ownsPrisma) await prisma.$disconnect();
  }
}
