/**
 * Normalize free-text queries for synonym lookup and fuzzy matching.
 * Preserves Devanagari / Telugu; strips Latin diacritics.
 */

const WORK_ALIASES = [
  "bhagavad gita",
  "bhagavadgita",
  "bhagwat geeta",
  "bhagwatgita",
  "bagavadgita",
  "bagavad gita",
  "bhagawad geetha",
  "bhagawadgita",
  "bhagavad geeta",
  "bhagavad geetha",
  "bg",
  "gita",
  "geeta",
  "geetha",
] as const;

/** Compact Latin for fuzzy compare (drop spaces/hyphens). */
export function compactLatin(value: string): string {
  return value.replace(/[\s.-]+/g, "");
}

export function normalizeSearchQuery(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f\u0c00-\u0c7f\s.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeQuery(normalized: string): string[] {
  if (!normalized) return [];
  return normalized.split(/\s+/).filter((t) => t.length > 0);
}

/** True when the query only names the Bhagavad Gita (any spelling). */
export function isWorkAliasOnly(normalized: string): boolean {
  if (!normalized) return false;
  const compact = compactLatin(normalized);
  for (const alias of WORK_ALIASES) {
    if (normalized === alias || compact === compactLatin(alias)) return true;
  }
  return false;
}

/**
 * Builtin spelling / synonym expansions (also seeded into search_terms).
 * Keys and values are normalized lowercase.
 */
export const BUILTIN_TERM_GROUPS: ReadonlyArray<{
  canonical: string;
  kind: "synonym" | "spelling" | "transliteration";
  terms: readonly string[];
}> = [
  {
    canonical: "bhagavad gita",
    kind: "spelling",
    terms: [
      "bhagavad gita",
      "bhagavadgita",
      "bhagwat geeta",
      "bhagwatgita",
      "bagavadgita",
      "bagavad gita",
      "bhagawad geetha",
      "bhagawadgita",
      "bhagavad geeta",
      "bhagavad geetha",
      "geeta",
      "geetha",
    ],
  },
  {
    canonical: "krishna",
    kind: "spelling",
    terms: ["krishna", "krsna", "krushna", "krisna", "कृष्ण"],
  },
  {
    canonical: "arjuna",
    kind: "spelling",
    terms: ["arjuna", "arjun", "अर्जुन"],
  },
  {
    canonical: "krodha",
    kind: "synonym",
    terms: ["anger", "krodha", "wrath", "rage", "क्रोध"],
  },
  {
    canonical: "shanti",
    kind: "synonym",
    terms: ["peace", "shanti", "tranquility", "शान्ति", "శాంతి"],
  },
  {
    canonical: "karma",
    kind: "synonym",
    terms: ["work", "karma", "action", "duty", "कर्म", "కర్మ"],
  },
  {
    canonical: "jnana",
    kind: "synonym",
    terms: ["knowledge", "jnana", "wisdom", "ज्ञान", "జ్ఞానం"],
  },
  {
    canonical: "bhakti",
    kind: "synonym",
    terms: ["devotion", "bhakti", "love", "भक्ति", "భక్తి"],
  },
  {
    canonical: "atma",
    kind: "synonym",
    terms: ["soul", "atma", "self", "आत्मा", "ఆత్మ"],
  },
  {
    canonical: "yoga",
    kind: "synonym",
    terms: ["yoga", "union", "discipline", "योग"],
  },
  {
    canonical: "dharma",
    kind: "synonym",
    terms: ["dharma", "righteousness", "धर्म", "ధర్మం"],
  },
  {
    canonical: "moksha",
    kind: "synonym",
    terms: ["liberation", "moksha", "freedom", "मोक्ष"],
  },
  {
    canonical: "death",
    kind: "synonym",
    terms: ["death", "dying", "mrtyu", "मृत्यु"],
  },
  {
    canonical: "mind",
    kind: "synonym",
    terms: ["mind", "manas", "बुद्धि", "मन"],
  },
  {
    canonical: "meditation",
    kind: "synonym",
    terms: ["meditation", "dhyana", "ध्यान"],
  },
  {
    canonical: "detachment",
    kind: "synonym",
    terms: ["detachment", "vairagya", "renunciation", "वैराग्य"],
  },
];

export function expandWithBuiltins(normalized: string): string[] {
  const out = new Set<string>();
  if (!normalized) return [];
  out.add(normalized);
  for (const token of tokenizeQuery(normalized)) {
    out.add(token);
  }
  const compact = compactLatin(normalized);
  const tokens = tokenizeQuery(normalized);

  for (const group of BUILTIN_TERM_GROUPS) {
    const groupTerms = group.terms.map((t) => normalizeSearchQuery(t));
    const hit = groupTerms.some((t) => {
      if (t === normalized || compactLatin(t) === compact) return true;
      if (tokens.includes(t)) return true;
      if (tokens.some((tok) => compactLatin(tok) === compactLatin(t))) return true;
      return false;
    });
    if (hit) {
      out.add(group.canonical);
      for (const t of groupTerms) {
        out.add(t);
        for (const tok of tokenizeQuery(t)) out.add(tok);
      }
    }
  }
  return [...out].filter(Boolean);
}
