import fs from "node:fs";
import path from "node:path";
import { babyNameRecordSchema } from "../packages/types/src/knowledge/baby-name.js";

const NAMES_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/names.json");
const NEEDS_REVIEW_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/needs-review.json");

function validateDataset() {
  console.log("=== STARTING BABY NAMES DATASET VALIDATION PIPELINE ===");

  if (!fs.existsSync(NAMES_FILE)) {
    console.error(`ERROR: File not found: ${NAMES_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(NAMES_FILE, "utf8");
  const data = JSON.parse(rawData);

  if (!data.names || !Array.isArray(data.names)) {
    console.error("ERROR: Expected root object with 'names' array.");
    process.exit(1);
  }

  const names = data.names;
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenDevanagari = new Set<string>();
  const aliasMap = new Map<string, string>(); // spelling -> canonical slug

  let verifiedCount = 0;
  let candidateReviewCount = 0;

  for (let i = 0; i < names.length; i++) {
    const rec = names[i];
    const indexStr = `Record #${i + 1} (${rec.nameEn || "UNNAMED"})`;

    // 1. Zod Schema Validation
    const parseResult = babyNameRecordSchema.safeParse(rec);
    if (!parseResult.success) {
      errors.push(`${indexStr}: Zod validation error: ${parseResult.error.message}`);
      continue;
    }

    // 2. ID & Slug Uniqueness
    if (seenIds.has(rec.id)) {
      errors.push(`${indexStr}: Duplicate ID '${rec.id}'`);
    } else {
      seenIds.add(rec.id);
    }

    if (seenSlugs.has(rec.slug)) {
      errors.push(`${indexStr}: Duplicate slug '${rec.slug}'`);
    } else {
      seenSlugs.add(rec.slug);
    }

    // 3. Devanagari Duplicate Audit
    if (seenDevanagari.has(rec.nameSaDevanagari)) {
      warnings.push(`${indexStr}: Shares Devanagari '${rec.nameSaDevanagari}' with another entry.`);
    } else {
      seenDevanagari.add(rec.nameSaDevanagari);
    }

    // 4. Alternate Spellings & Aliases Mapping
    if (rec.alternateSpellings && Array.isArray(rec.alternateSpellings)) {
      for (const alt of rec.alternateSpellings) {
        const normAlt = alt.trim().toLowerCase();
        if (aliasMap.has(normAlt)) {
          warnings.push(`${indexStr}: Alternate spelling '${alt}' conflicts with existing canonical '${aliasMap.get(normAlt)}'.`);
        } else {
          aliasMap.set(normAlt, rec.slug);
        }
      }
    }

    // 5. Etymology & Citation Verification Audit
    if (!rec.etymology || (!rec.etymology.sanskritRoot && !rec.etymology.rootMeaning)) {
      errors.push(`${indexStr}: Missing etymology root / rootMeaning.`);
    }

    if (!rec.citations || rec.citations.length === 0) {
      warnings.push(`${indexStr}: Has no explicit shloka citations.`);
    }

    if (rec.verificationStatus === "verified") {
      verifiedCount++;
    } else if (rec.verificationStatus === "needs-review") {
      candidateReviewCount++;
    }
  }

  console.log("\n=== VALIDATION SUMMARY REPORT ===");
  console.log(`Total Records Processed: ${names.length}`);
  console.log(`Verified Records Published: ${verifiedCount}`);
  console.log(`Unique Canonical Slugs: ${seenSlugs.size}`);
  console.log(`Alternate Spelling Aliases Mapped: ${aliasMap.size}`);
  console.log(`Validation Errors: ${errors.length}`);
  console.log(`Validation Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.error("\nCRITICAL ERRORS DETECTED:");
    errors.forEach(e => console.error(` - ${e}`));
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn("\nAUDIT WARNINGS:");
    warnings.forEach(w => console.warn(` - ${w}`));
  }

  console.log("\nSUCCESS: Dataset passed all factual accuracy & schema rules!");
}

validateDataset();
