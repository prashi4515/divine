import { z } from "zod";

export const NAME_CLASSIFICATIONS = [
  "SCRIPTURAL_ATTESTED",
  "SANSKRIT_LEXICAL",
  "VEDIC",
  "UPANISHADIC",
  "MAHABHARATA",
  "RAMAYANA",
  "BHAGAVAD_GITA",
  "PURANIC",
  "DEITY_OR_EPITHET",
  "SANSKRIT_DERIVED_MODERN",
  "MODERN_USAGE_WITH_UNCERTAIN_ETYMOLOGY",
  "NEEDS_REVIEW",
  "REJECTED",
] as const;

export type NameClassification = (typeof NAME_CLASSIFICATIONS)[number];

export const NAME_CLASSIFICATION_LABELS: Record<NameClassification, string> = {
  SCRIPTURAL_ATTESTED: "Scriptural Attested",
  SANSKRIT_LEXICAL: "Sanskrit Lexical",
  VEDIC: "Vedic Literature",
  UPANISHADIC: "Upanishadic",
  MAHABHARATA: "Mahabharata",
  RAMAYANA: "Ramayana",
  BHAGAVAD_GITA: "Bhagavad Gita",
  PURANIC: "Puranic",
  DEITY_OR_EPITHET: "Deity Epithet",
  SANSKRIT_DERIVED_MODERN: "Sanskrit Derived Modern",
  MODERN_USAGE_WITH_UNCERTAIN_ETYMOLOGY: "Modern Usage",
  NEEDS_REVIEW: "Needs Review",
  REJECTED: "Rejected",
};

export const NAME_GENDERS = ["boy", "girl", "unisex"] as const;
export type NameGenderUsage = (typeof NAME_GENDERS)[number];

export const scriptureCitationSchema = z.object({
  scriptureId: z.enum([
    "bhagavad-gita",
    "mahabharata",
    "ramayana",
    "rigveda",
    "yajurveda",
    "samaveda",
    "atharvaveda",
    "principal-upanishads",
    "purana",
    "classical-sanskrit",
  ]),
  bookOrParva: z.string(),
  sectionOrVerse: z.string(),
  sanskritSnippetSa: z.string().optional(),
  translationEn: z.string().optional(),
  verifiableNote: z.string(),
});

export type ScriptureCitation = z.infer<typeof scriptureCitationSchema>;

export const babyNameMeaningsSchema = z.object({
  primaryMeaning: z.string(),
  literalSanskrit: z.string(),
  traditionalInterpretation: z.string(),
  characterContext: z.string().optional(),
  modernUsageNote: z.string().optional(),
});

export type BabyNameMeanings = z.infer<typeof babyNameMeaningsSchema>;

export const babyNameEtymologySchema = z.object({
  sanskritRoot: z.string().optional(),
  rootMeaning: z.string().optional(),
  grammaticalNotes: z.string().optional(),
  confidenceLevel: z.enum(["high", "medium", "uncertain"]),
});

export type BabyNameEtymology = z.infer<typeof babyNameEtymologySchema>;

export const babyNameRecordSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameEn: z.string(),
  preferredName: z.string().optional(),
  nameSaDevanagari: z.string(),
  nameIAST: z.string(),
  startingLetter: z.string(),
  genderUsage: z.enum(NAME_GENDERS),
  classification: z.enum(NAME_CLASSIFICATIONS),
  meanings: babyNameMeaningsSchema,
  etymology: babyNameEtymologySchema,
  primaryScripture: z.string(),
  scriptureSources: z.array(z.string()).optional(),
  citations: z.array(scriptureCitationSchema),
  associatedEntityId: z.string().optional(),
  associatedDeityId: z.string().optional(),
  relatedGitaVerseIds: z.array(z.string()).optional(),
  relatedPlaceIds: z.array(z.string()).optional(),
  relatedPersonIds: z.array(z.string()).optional(),
  themes: z.array(z.string()),
  relatedNameIds: z.array(z.string()),
  alternateSpellings: z.array(z.string()),
  verificationStatus: z.enum(["verified", "needs-review", "rejected"]).default("verified"),
});

export type BabyNameRecord = z.infer<typeof babyNameRecordSchema>;

export const babyNameCollectionSchema = z.object({
  version: z.string(),
  updatedAt: z.string(),
  names: z.array(babyNameRecordSchema),
});

export type BabyNameCollection = z.infer<typeof babyNameCollectionSchema>;

export interface CandidateNameReview {
  name: string;
  candidateMeaning: string;
  sourceReferences: string[];
  reasonForReview: string;
}
