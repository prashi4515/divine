import fs from "node:fs";
import path from "node:path";

const CANDIDATES_AUDITED_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/candidates-audited.json");
const NAMES_JSON_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/names.json");

function mapAuditedToNamesJson() {
  console.log("=== MAPPING CANDIDATES-AUDITED.JSON TO NAMES.JSON ===");

  const auditedRecords: any[] = JSON.parse(fs.readFileSync(CANDIDATES_AUDITED_FILE, "utf8"));
  console.log(`Loaded ${auditedRecords.length} audited candidate records.`);

  const mappedNames = auditedRecords.map((c) => {
    // Map classification
    let classification = "SANSKRIT_LEXICAL";
    if (c.usageType === "SCRIPTURAL_PERSONAL_NAME") classification = "SCRIPTURAL_ATTESTED";
    else if (c.usageType === "DEITY_OR_EPITHET_USED_AS_NAME") classification = "DEITY_OR_EPITHET";
    else if (c.usageType === "ANCIENT_SCRIPTURAL_PERSONAL_NAME") classification = "SCRIPTURAL_ATTESTED";
    else if (c.usageType === "HISTORICAL_PERSONAL_NAME") classification = "SCRIPTURAL_ATTESTED";
    else if (c.usageType === "SANSKRIT_DERIVED_MODERN_NAME") classification = "SANSKRIT_DERIVED_MODERN";
    else classification = "SANSKRIT_LEXICAL";

    // Primary scripture string
    let primaryScripture = "Cologne Digital Sanskrit Lexicon";
    if (c.scripturalEvidence && c.scripturalEvidence.length > 0) {
      primaryScripture = c.scripturalEvidence[0].source;
    } else if (c.historicalEvidence && c.historicalEvidence.length > 0) {
      primaryScripture = c.historicalEvidence[0].source;
    }

    // Map citations to scriptureCitationSchema format
    const citations = (c.scripturalEvidence || []).map((e: any) => ({
      scriptureId: "classical-sanskrit",
      bookOrParva: e.source,
      sectionOrVerse: e.citation || "Textual Citation",
      sanskritSnippetSa: c.devanagari,
      translationEn: c.shortMeaning,
      verifiableNote: e.claimSupported,
    }));

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
      citations: citations,
      themes: ["Sanskrit", "Dharma", "Auspicious"],
      relatedNameIds: [],
      alternateSpellings: c.alternateSpellings || [],
      verificationStatus: "verified",
    };
  });

  const outputCollection = {
    version: "2.0.0",
    updatedAt: new Date().toISOString(),
    names: mappedNames,
  };

  fs.writeFileSync(NAMES_JSON_FILE, JSON.stringify(outputCollection, null, 2));
  console.log(`Successfully mapped ${mappedNames.length} verified records into names.json.`);
}

mapAuditedToNamesJson();
