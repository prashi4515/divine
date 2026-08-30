import { z } from "zod";

export const NAME_CLASSIFICATIONS = [
  "SCRIPTURAL_ATTESTED",
  "TRADITIONALLY_ATTESTED",
  "SANSKRIT_ETYMOLOGICAL",
  "MODERN_USAGE",
] as const;

export type NameClassification = (typeof NAME_CLASSIFICATIONS)[number];

export const NAME_CLASSIFICATION_LABELS: Record<NameClassification, string> = {
  SCRIPTURAL_ATTESTED: "Scriptural Attested",
  TRADITIONALLY_ATTESTED: "Traditionally Attested",
  SANSKRIT_ETYMOLOGICAL: "Sanskrit Etymological",
  MODERN_USAGE: "Modern Usage & Inspired",
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

export const babyNameTranslationSchema = z.object({
  languageCode: z.string(),
  nameLocalized: z.string(),
  primaryMeaningLocalized: z.string(),
  scriptureContextLocalized: z.string().optional(),
});

export type BabyNameTranslation = z.infer<typeof babyNameTranslationSchema>;

export const babyNameRecordSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameEn: z.string(),
  nameSaDevanagari: z.string(),
  nameIAST: z.string(),
  startingLetter: z.string(),
  genderUsage: z.enum(NAME_GENDERS),
  classification: z.enum(NAME_CLASSIFICATIONS),
  meanings: babyNameMeaningsSchema,
  etymology: babyNameEtymologySchema,
  primaryScripture: z.string(),
  citations: z.array(scriptureCitationSchema),
  associatedEntityId: z.string().optional(),
  associatedDeityId: z.string().optional(),
  relatedGitaVerseIds: z.array(z.string()).optional(),
  relatedPlaceIds: z.array(z.string()).optional(),
  relatedPersonIds: z.array(z.string()).optional(),
  themes: z.array(z.string()),
  relatedNameIds: z.array(z.string()),
  alternateSpellings: z.array(z.string()),
  translations: z.array(babyNameTranslationSchema).optional(),
});

export type BabyNameRecord = z.infer<typeof babyNameRecordSchema>;

export const babyNameCollectionSchema = z.object({
  version: z.string(),
  updatedAt: z.string(),
  names: z.array(babyNameRecordSchema),
});

export type BabyNameCollection = z.infer<typeof babyNameCollectionSchema>;
