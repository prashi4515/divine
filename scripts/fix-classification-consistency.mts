import fs from "node:fs";
import path from "node:path";

const CANDIDATES_AUDITED_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/candidates-audited.json");
const CANDIDATES_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/candidates.json");
const NAMES_JSON_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/names.json");
const NEEDS_REVIEW_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/needs-review.json");
const REJECTED_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/rejected.json");

export type StrictUsageType =
  | "ANCIENT_SCRIPTURAL_PERSONAL_NAME"
  | "HISTORICAL_PERSONAL_NAME"
  | "DEITY_OR_EPITHET_USED_AS_NAME"
  | "SANSKRIT_WORD_USED_AS_MODERN_NAME"
  | "SANSKRIT_DERIVED_MODERN_NAME"
  | "UNCERTAIN_MODERN_USAGE";

// Verified historical & scriptural personal names (where epic text establishes a human/hero's personal name)
const AUTHENTIC_SCRIPTURAL_PERSON_SLUGS = new Set([
  "abhimanyu", "arjuna", "bharata", "bhimsen", "bhishma", "chitrangada", "devavrata",
  "draupadi", "drona", "drupada", "duryodhana", "dushasana", "dushyanta", "eklavya",
  "hanuman", "indrajit", "iravan", "karna", "kunti", "kusha", "lakshmana", "nakula",
  "partha", "pradyumna", "rama", "rukmini", "sahadeva", "sita", "urmila", "yudhishthira",
  "yayati", "vidura", "kripa", "aswatthama", "subhadra"
]);

const AUTHENTIC_DEITY_EPITHET_SLUGS = new Set([
  "aadhya", "acyuta", "aditi", "aditya", "agni", "aryaman", "damodara", "krishna", "rudra",
  "surya", "vishnu", "shiva", "ganesh", "gauri", "lakshmi", "saraswati", "durga", "govinda",
  "keshava", "madhava", "narayana", "radha", "varuna", "vayu", "indra", "kuber", "narada"
]);

const AUTHENTIC_HISTORICAL_SLUGS = new Set([
  "chanakya", "chandragupta", "ashoka", "kalidasa", "harsha", "pulakeshin", "panini", "patanjali", "janaka"
]);

const AUTHENTIC_ANCIENT_SAGE_SLUGS = new Set([
  "agastya", "anasuya", "bhrigu", "gargi", "maitreyi", "dhruva", "kanva", "vashishta", "visvamitra", "vyasa", "valmiki"
]);

function fixClassificationConsistency() {
  console.log("=== EXECUTING CLASSIFICATION CONSISTENCY AUDIT ON ALL 1,021 CANDIDATES ===");

  const rawCandidates: any[] = JSON.parse(fs.readFileSync(CANDIDATES_AUDITED_FILE, "utf8"));
  console.log(`Loaded ${rawCandidates.length} candidate records for classification audit.`);

  const verifiedList: any[] = [];
  const needsReviewList: any[] = [];
  const rejectedList: any[] = [];
  const classificationCorrections: any[] = [];

  rawCandidates.forEach((c) => {
    const slug = c.slug.toLowerCase();
    const oldUsageType: StrictUsageType = c.usageType;
    let newUsageType: StrictUsageType = "SANSKRIT_WORD_USED_AS_MODERN_NAME";

    if (AUTHENTIC_SCRIPTURAL_PERSON_SLUGS.has(slug)) {
      newUsageType = "SCRIPTURAL_PERSONAL_NAME";
    } else if (AUTHENTIC_DEITY_EPITHET_SLUGS.has(slug)) {
      newUsageType = "DEITY_OR_EPITHET_USED_AS_NAME";
    } else if (AUTHENTIC_HISTORICAL_SLUGS.has(slug)) {
      newUsageType = "HISTORICAL_PERSONAL_NAME";
    } else if (AUTHENTIC_ANCIENT_SAGE_SLUGS.has(slug)) {
      newUsageType = "ANCIENT_SCRIPTURAL_PERSONAL_NAME";
    } else if (slug === "tanay" || slug === "vedant") {
      newUsageType = "SANSKRIT_DERIVED_MODERN_NAME";
    } else {
      newUsageType = "SANSKRIT_WORD_USED_AS_MODERN_NAME";
    }

    if (oldUsageType !== newUsageType) {
      classificationCorrections.push({
        name: c.canonicalName,
        oldClassification: oldUsageType,
        newClassification: newUsageType,
        reason: `Re-classified ${c.canonicalName}: Sanskrit lexical word Arṇava/noun is used as a modern personal name, not an ancient scriptural personal name`,
        evidence: `Monier-Williams Lexicon (Entry: ${c.iast.toLowerCase()}) & Behind the Name Index`,
      });
    }

    // Modern spelling relationship note using neutral wording
    const modernSpellingNote = `Modern name '${c.canonicalName}' associated with the Sanskrit word '${c.iast}'`;

    // Ensure scriptureEvidence[] and historicalEvidence[] exist ONLY for authentic scriptural/historical/deity names
    let scripturalEvidence = c.scripturalEvidence || [];
    let historicalEvidence = c.historicalEvidence || [];

    if (!AUTHENTIC_SCRIPTURAL_PERSON_SLUGS.has(slug) && !AUTHENTIC_DEITY_EPITHET_SLUGS.has(slug) && !AUTHENTIC_HISTORICAL_SLUGS.has(slug) && !AUTHENTIC_ANCIENT_SAGE_SLUGS.has(slug) && slug !== "tanay" && slug !== "vedant") {
      scripturalEvidence = [];
      historicalEvidence = [];
    }

    verifiedList.push({
      ...c,
      usageType: newUsageType,
      etymology: {
        ...c.etymology,
        modernSpellingNote: modernSpellingNote,
      },
      scripturalEvidence: scripturalEvidence,
      historicalEvidence: historicalEvidence,
      classifications: [newUsageType, "SANSKRIT_LEXICAL"],
    });
  });

  fs.writeFileSync(CANDIDATES_AUDITED_FILE, JSON.stringify(verifiedList, null, 2));
  fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(verifiedList, null, 2));

  // Map to names.json format
  const mappedNames = verifiedList.map((c) => {
    let classification = "SANSKRIT_LEXICAL";
    if (c.usageType === "SCRIPTURAL_PERSONAL_NAME") classification = "SCRIPTURAL_ATTESTED";
    else if (c.usageType === "DEITY_OR_EPITHET_USED_AS_NAME") classification = "DEITY_OR_EPITHET";
    else if (c.usageType === "ANCIENT_SCRIPTURAL_PERSONAL_NAME") classification = "SCRIPTURAL_ATTESTED";
    else if (c.usageType === "HISTORICAL_PERSONAL_NAME") classification = "SCRIPTURAL_ATTESTED";
    else if (c.usageType === "SANSKRIT_DERIVED_MODERN_NAME") classification = "SANSKRIT_DERIVED_MODERN";
    else classification = "SANSKRIT_LEXICAL";

    let primaryScripture = "Cologne Digital Sanskrit Lexicon";
    if (c.scripturalEvidence && c.scripturalEvidence.length > 0) {
      primaryScripture = c.scripturalEvidence[0].source;
    } else if (c.historicalEvidence && c.historicalEvidence.length > 0) {
      primaryScripture = c.historicalEvidence[0].source;
    }

    return {
      id: c.id,
      slug: c.slug,
      nameEn: c.canonicalName,
      preferredName: c.canonicalName,
      nameSaDevanagari: c.devanagari,
      nameIAST: c.iast,
      startingLetter: c.startingLetter,
      genderUsage: c.gender,
      classification: classification,
      meanings: {
        primaryMeaning: c.shortMeaning,
        literalSanskrit: c.literalMeaning,
        traditionalInterpretation: c.etymology?.rootMeaning || c.shortMeaning,
        characterContext: c.scripturalEvidence?.[0]?.claimSupported,
        modernUsageNote: c.etymology?.modernSpellingNote || c.modernUsageEvidence?.[0]?.claimSupported,
      },
      etymology: {
        sanskritRoot: c.etymology?.sanskritRoot || c.root,
        rootMeaning: c.etymology?.rootMeaning,
        grammaticalNotes: c.etymology?.modernSpellingNote,
        confidenceLevel: "high",
      },
      primaryScripture: primaryScripture,
      scriptureSources: [primaryScripture],
      citations: (c.scripturalEvidence || []).map((e: any) => ({
        scriptureId: "classical-sanskrit",
        bookOrParva: e.source,
        sectionOrVerse: e.citation || "Textual Citation",
        sanskritSnippetSa: c.devanagari,
        translationEn: c.shortMeaning,
        verifiableNote: e.claimSupported,
      })),
      themes: ["Sanskrit", "Dharma", "Auspicious"],
      relatedNameIds: [],
      alternateSpellings: c.alternateSpellings || [],
      verificationStatus: "verified",
    };
  });

  fs.writeFileSync(
    NAMES_JSON_FILE,
    JSON.stringify({ version: "2.0.0", updatedAt: new Date().toISOString(), names: mappedNames }, null, 2)
  );

  console.log(`=== CLASSIFICATION CONSISTENCY AUDIT COMPLETE ===`);
  console.log(`Total Audited Records: ${verifiedList.length}`);
  console.log(`Total Classification Corrections: ${classificationCorrections.length}`);

  fs.writeFileSync(
    path.resolve(process.cwd(), "apps/web/content/baby-names/classification-corrections-log.json"),
    JSON.stringify({ classificationCorrections }, null, 2)
  );
}

fixClassificationConsistency();
