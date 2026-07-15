/**
 * Parser — read raw JSON, detect schema version, produce typed document.
 *
 * Responsibility boundary: I/O + structural Zod parse ONLY.
 * No DB access, no referential checks (those belong to Validator).
 */

import { readFile } from "node:fs/promises";
import { z } from "zod";
import {
  IMPORT_SCHEMA_VERSION,
  contentImportV1Schema,
  type ContentImportV1,
} from "../schema/index.mts";
import { IssueCollector } from "../reporter/issues.mts";

export type ParseResult =
  | { ok: true; document: ContentImportV1; issues: IssueCollector }
  | { ok: false; document: null; issues: IssueCollector };

const versionProbeSchema = z.object({
  schemaVersion: z.string(),
}).passthrough();

export async function parseFile(filePath: string): Promise<ParseResult> {
  const issues = new IssueCollector();
  let raw: string;

  try {
    raw = await readFile(filePath, "utf8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    issues.error("PARSE_INVALID_JSON", "$", `Cannot read file: ${message}`);
    return { ok: false, document: null, issues };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw) as unknown;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    issues.error("PARSE_INVALID_JSON", "$", `Invalid JSON: ${message}`);
    return { ok: false, document: null, issues };
  }

  return parseDocument(json, issues);
}

export function parseDocument(
  json: unknown,
  issues: IssueCollector = new IssueCollector(),
): ParseResult {
  const probe = versionProbeSchema.safeParse(json);
  if (!probe.success) {
    issues.error(
      "PARSE_UNSUPPORTED_VERSION",
      "$.schemaVersion",
      "Missing schemaVersion field",
      `Expected "${IMPORT_SCHEMA_VERSION}"`,
    );
    return { ok: false, document: null, issues };
  }

  if (probe.data.schemaVersion !== IMPORT_SCHEMA_VERSION) {
    issues.error(
      "PARSE_UNSUPPORTED_VERSION",
      "$.schemaVersion",
      `Unsupported schemaVersion "${probe.data.schemaVersion}"`,
      `Supported: "${IMPORT_SCHEMA_VERSION}"`,
    );
    return { ok: false, document: null, issues };
  }

  const parsed = contentImportV1Schema.safeParse(json);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = `$.${issue.path.join(".")}` || "$";
      issues.error("PARSE_SCHEMA", path, issue.message);
    }
    return { ok: false, document: null, issues };
  }

  return { ok: true, document: parsed.data, issues };
}
