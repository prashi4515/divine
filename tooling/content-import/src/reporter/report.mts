/**
 * Reporter — progress events + final summary.
 *
 * Kept separate from Importer so CLI / CI / future admin UI can plug in
 * different sinks without touching write logic.
 */

import type { Issue } from "./issues.mts";

export type ProgressPhase =
  | "parse"
  | "validate"
  | "import"
  | "complete";

export interface ProgressEvent {
  phase: ProgressPhase;
  message: string;
  current?: number;
  total?: number;
}

export interface EntityCounts {
  languages: number;
  translationSources: number;
  topics: number;
  emotions: number;
  works: number;
  chapters: number;
  verses: number;
  translations: number;
  verseTopics: number;
  verseEmotions: number;
}

export interface ImportSummary {
  dryRun: boolean;
  success: boolean;
  filePath: string;
  schemaVersion: string | null;
  workCode: string | null;
  durationMs: number;
  planned: EntityCounts;
  written: EntityCounts;
  issues: Issue[];
}

export type ProgressSink = (event: ProgressEvent) => void;

export function emptyCounts(): EntityCounts {
  return {
    languages: 0,
    translationSources: 0,
    topics: 0,
    emotions: 0,
    works: 0,
    chapters: 0,
    verses: 0,
    translations: 0,
    verseTopics: 0,
    verseEmotions: 0,
  };
}

export function formatSummary(summary: ImportSummary): string {
  const lines: string[] = [];
  lines.push("");
  lines.push("═══════════════════════════════════════════");
  lines.push(`  Content Import ${summary.dryRun ? "(DRY RUN)" : "REPORT"}`);
  lines.push("═══════════════════════════════════════════");
  lines.push(`  File:           ${summary.filePath}`);
  lines.push(`  Schema:         ${summary.schemaVersion ?? "—"}`);
  lines.push(`  Work:           ${summary.workCode ?? "—"}`);
  lines.push(`  Result:         ${summary.success ? "SUCCESS" : "FAILED"}`);
  lines.push(`  Duration:       ${summary.durationMs}ms`);
  lines.push("");
  lines.push("  Planned / Written");
  for (const key of Object.keys(summary.planned) as (keyof EntityCounts)[]) {
    const p = summary.planned[key];
    const w = summary.written[key];
    if (p === 0 && w === 0) continue;
    lines.push(`    ${key.padEnd(20)} ${String(p).padStart(4)} → ${String(w).padStart(4)}`);
  }

  const errors = summary.issues.filter((i) => i.severity === "error");
  const warnings = summary.issues.filter((i) => i.severity === "warning");

  if (errors.length > 0) {
    lines.push("");
    lines.push(`  Errors (${errors.length})`);
    for (const e of errors) {
      lines.push(`    [${e.code}] ${e.path}`);
      lines.push(`      ${e.message}`);
      if (e.hint) lines.push(`      hint: ${e.hint}`);
    }
  }

  if (warnings.length > 0) {
    lines.push("");
    lines.push(`  Warnings (${warnings.length})`);
    for (const w of warnings) {
      lines.push(`    [${w.code}] ${w.path}`);
      lines.push(`      ${w.message}`);
    }
  }

  lines.push("═══════════════════════════════════════════");
  lines.push("");
  return lines.join("\n");
}

export function createConsoleProgress(): ProgressSink {
  return (event) => {
    const pct =
      event.current !== undefined && event.total !== undefined && event.total > 0
        ? ` [${event.current}/${event.total}]`
        : "";
    process.stderr.write(`[${event.phase}]${pct} ${event.message}\n`);
  };
}
