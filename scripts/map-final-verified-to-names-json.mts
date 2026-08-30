import fs from "node:fs";
import path from "node:path";

const CANDIDATES_FINAL_AUDITED_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/candidates-final-audited.json");
const NAMES_JSON_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/names.json");

function mapFinalVerifiedToNamesJson() {
  console.log("=== MAPPING ONLY 243 VERIFIED RECORDS FROM CANDIDATES-FINAL-AUDITED.JSON TO NAMES.JSON ===");

  const auditedRecords: any[] = JSON.parse(fs.readFileSync(CANDIDATES_FINAL_AUDITED_FILE, "utf8"));
  const verifiedRecords = auditedRecords.filter((c) => c.status === "VERIFIED");
  console.log(`Loaded ${auditedRecords.length} total records; filtering to ${verifiedRecords.length} VERIFIED records.`);

  const mappedNames = verifiedRecords.map((c) => {
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

    const modernWording = `${c.canonicalName} is a modern name associated with the Sanskrit word ${c.iast}.`;

    return {
      id: c.id,
      slug: c.slug,
      nameEn: c.canonicalName,
      preferredName: c.canonicalName,
      nameSaDevanagari: c.devanagari,
      nameIAST: c.iast,
      startingLetter: c.startingLetter || c.canonicalName[0].toUpperCase(),
      genderUsage: c.gender,
      classification: classification,
      meanings: {
        primaryMeaning: c.shortMeaning,
        literalSanskrit: c.literalMeaning,
        traditionalInterpretation: c.etymology?.rootMeaning || c.shortMeaning,
        characterContext: c.scripturalEvidence?.[0]?.claimSupported,
        modernUsageNote: modernWording,
      },
      etymology: {
        sanskritRoot: c.etymology?.sanskritRoot || c.root,
        rootMeaning: c.etymology?.rootMeaning,
        grammaticalNotes: modernWording,
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

  const outputCollection = {
    version: "2.0.0",
    updatedAt: new Date().toISOString(),
    names: mappedNames,
  };

  fs.writeFileSync(NAMES_JSON_FILE, JSON.stringify(outputCollection, null, 2));
  console.log(`Successfully mapped ${mappedNames.length} VERIFIED records into names.json.`);
}

mapFinalVerifiedToNamesJson();
