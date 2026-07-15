/**
 * Unit tests for parse + schema (no DB).
 * Run: node --test ./src/schema/v1.test.mts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseDocument } from "../parser/parse-file.mts";
import { contentImportV1Schema, IMPORT_SCHEMA_VERSION } from "./v1.mts";

const here = dirname(fileURLToPath(import.meta.url));
const exampleFixturePath = join(here, "../../fixtures/example.v1.json");
const bgChaptersFixturePath = join(here, "../../fixtures/bg-chapters.v1.json");

describe("contentImportV1Schema", () => {
  it("accepts the example fixture", async () => {
    const raw = JSON.parse(await readFile(exampleFixturePath, "utf8")) as unknown;
    const result = contentImportV1Schema.safeParse(raw);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.schemaVersion, IMPORT_SCHEMA_VERSION);
      assert.equal(result.data.work.code, "ex");
      assert.equal(result.data.chapters[0]?.verses.length, 2);
    }
  });

  it("accepts the bg-chapters fixture (chapters only, zero verses)", async () => {
    const raw = JSON.parse(await readFile(bgChaptersFixturePath, "utf8")) as unknown;
    const result = contentImportV1Schema.safeParse(raw);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.work.code, "bg");
      assert.equal(result.data.chapters.length, 18);
      assert.ok(result.data.chapters.every((c) => c.verses.length === 0));
      assert.ok(result.data.chapters.every((c) => c.isPublished === true));
    }
  });

  it("rejects wrong schemaVersion", () => {
    const result = parseDocument({
      schemaVersion: "9.9.9",
      meta: { name: "x" },
      work: { code: "x", slug: "x", title: "x" },
      chapters: [],
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.issues.issues.some((i) => i.code === "PARSE_UNSUPPORTED_VERSION"),
    );
  });

  it("rejects invalid JSON shape with path-level errors", () => {
    const result = parseDocument({
      schemaVersion: IMPORT_SCHEMA_VERSION,
      meta: { name: "x" },
      work: { code: "x", slug: "x", title: "x" },
      chapters: [
        {
          number: 0,
          publicId: "x.0",
          verses: [],
        },
      ],
    });
    assert.equal(result.ok, false);
    assert.ok(result.issues.issues.some((i) => i.code === "PARSE_SCHEMA"));
  });
});
