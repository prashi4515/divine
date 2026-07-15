/**
 * Structured issue model for validation + import reporting.
 * Path uses JSONPath-ish dotted notation for operator debugging.
 */

export type IssueSeverity = "error" | "warning" | "info";

export type IssueCode =
  | "PARSE_INVALID_JSON"
  | "PARSE_UNSUPPORTED_VERSION"
  | "PARSE_SCHEMA"
  | "DUP_IN_FILE"
  | "DUP_IN_DB"
  | "REF_MISSING"
  | "REF_MISMATCH"
  | "PUBLIC_ID_FORMAT"
  | "IMPORT_FAILED"
  | "IMPORT_SKIPPED";

export interface Issue {
  severity: IssueSeverity;
  code: IssueCode;
  path: string;
  message: string;
  hint?: string;
}

export class IssueCollector {
  readonly issues: Issue[] = [];

  error(code: IssueCode, path: string, message: string, hint?: string): void {
    this.issues.push({ severity: "error", code, path, message, hint });
  }

  warning(code: IssueCode, path: string, message: string, hint?: string): void {
    this.issues.push({ severity: "warning", code, path, message, hint });
  }

  info(code: IssueCode, path: string, message: string, hint?: string): void {
    this.issues.push({ severity: "info", code, path, message, hint });
  }

  get errorCount(): number {
    return this.issues.filter((i) => i.severity === "error").length;
  }

  get hasErrors(): boolean {
    return this.errorCount > 0;
  }
}
