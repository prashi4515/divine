/**
 * Fast public verse search over the on-disk Gita snapshots.
 * Avoids the Nest/Neon search path (multi-second ILIKE scans per query).
 */

import type { VerseSearchResponse, VerseSearchResult } from "@divine/types";
import { getStaticGitaChapter } from "@/lib/reading/gita-static";

type IndexedVerse = {
  publicId: string;
  chapterNumber: number;
  verseNumber: number;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  /** language code → translation text */
  byLang: Record<string, string>;
  /** Lowercased haystack used for matching */
  haystack: string;
  /** Topic slugs inferred from content keywords */
  topics: string[];
};

type TermGroup = {
  canonical: string;
  terms: readonly string[];
  topics?: readonly string[];
};

const TERM_GROUPS: readonly TermGroup[] = [
  {
    canonical: "dharma",
    terms: ["dharma", "righteousness", "duty", "justice", "fairness", "virtue", "धर्म"],
    topics: ["dharma", "duty"],
  },
  {
    canonical: "karma",
    terms: ["karma", "work", "action", "deed", "कर्म"],
    topics: ["karma", "duty"],
  },
  {
    canonical: "jnana",
    terms: ["jnana", "knowledge", "wisdom", "ज्ञान"],
    topics: ["jnana", "wisdom"],
  },
  {
    canonical: "bhakti",
    terms: ["bhakti", "devotion", "love", "worship", "भक्ति"],
    topics: ["bhakti"],
  },
  {
    canonical: "atma",
    terms: ["atma", "soul", "self", "spirit", "आत्मा"],
    topics: ["soul"],
  },
  {
    canonical: "krodha",
    terms: ["krodha", "anger", "wrath", "rage", "क्रोध"],
    topics: ["mind"],
  },
  {
    canonical: "shanti",
    terms: ["shanti", "peace", "tranquility", "शान्ति"],
    topics: ["peace"],
  },
  {
    canonical: "moksha",
    terms: ["moksha", "liberation", "freedom", "मोक्ष"],
  },
  {
    canonical: "yoga",
    terms: ["yoga", "union", "discipline", "योग"],
    topics: ["yoga"],
  },
  {
    canonical: "death",
    terms: ["death", "dying", "mrtyu", "मृत्यु"],
    topics: ["death"],
  },
  {
    canonical: "mind",
    terms: ["mind", "manas", "बुद्धि", "मन"],
    topics: ["mind"],
  },
  {
    canonical: "meditation",
    terms: ["meditation", "dhyana", "ध्यान"],
    topics: ["meditation"],
  },
  {
    canonical: "detachment",
    terms: ["detachment", "vairagya", "renunciation", "वैराग्य"],
    topics: ["detachment"],
  },
  {
    canonical: "kill",
    terms: ["kill", "slay", "destroy", "hanti", "हन"],
  },
];

const TOPIC_KEYWORDS: Record<string, readonly string[]> = {
  karma: ["karma", "action", "work", "fruit"],
  dharma: ["dharma", "righteous", "duty", "justice"],
  bhakti: ["bhakti", "devotion", "devotee", "worship"],
  jnana: ["jnana", "knowledge", "wisdom", "know"],
  mind: ["mind", "thought", "desire", "anger", "krodha"],
  meditation: ["meditation", "dhyana", "meditat"],
  soul: ["soul", "self", "atma", "spirit"],
  death: ["death", "die", "dying", "mortal"],
  duty: ["duty", "obligation", "svadharma"],
  detachment: ["detach", "renounc", "vairagya", "attachment"],
  peace: ["peace", "shanti", "calm", "tranquil"],
  yoga: ["yoga", "yogi"],
};

const TOPIC_NAMES: Record<string, string> = {
  karma: "Karma",
  dharma: "Dharma",
  bhakti: "Bhakti",
  jnana: "Jnana",
  mind: "Mind",
  meditation: "Meditation",
  soul: "Soul",
  death: "Death",
  duty: "Duty",
  detachment: "Detachment",
  peace: "Peace",
  yoga: "Yoga",
};

let indexPromise: Promise<IndexedVerse[]> | null = null;

function normalize(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f\u0c00-\u0c7f\s.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandQuery(normalized: string): string[] {
  const out = new Set<string>();
  if (!normalized) return [];
  out.add(normalized);
  for (const token of normalized.split(/\s+/).filter(Boolean)) {
    out.add(token);
  }
  for (const group of TERM_GROUPS) {
    const terms = group.terms.map(normalize);
    const hit = terms.some(
      (t) =>
        t === normalized ||
        normalized.split(/\s+/).includes(t) ||
        t.replace(/\s+/g, "") === normalized.replace(/\s+/g, ""),
    );
    if (hit) {
      out.add(group.canonical);
      for (const t of terms) out.add(t);
    }
  }
  return [...out].filter((t) => t.length >= 2);
}

/**
 * Whole-word / phrase match. Prevents "kill" matching inside "skill".
 * Latin uses word boundaries; Indic uses simple includes (scripts lack spaces the same way).
 */
function textMatchesTerm(haystack: string, term: string): boolean {
  if (!term) return false;
  if (/[\u0900-\u097f\u0c00-\u0c7f]/.test(term)) {
    return haystack.includes(term);
  }
  if (term.includes(" ")) {
    return haystack.includes(term);
  }
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i").test(
    haystack,
  );
}

function inferTopics(haystack: string): string[] {
  const found: string[] = [];
  for (const [slug, keys] of Object.entries(TOPIC_KEYWORDS)) {
    if (keys.some((k) => haystack.includes(k))) found.push(slug);
  }
  return found;
}

async function buildIndex(): Promise<IndexedVerse[]> {
  const chapters = await Promise.all(
    Array.from({ length: 18 }, (_, i) => getStaticGitaChapter(i + 1)),
  );
  const docs: IndexedVerse[] = [];

  for (const chapter of chapters) {
    for (const verse of chapter.verses) {
      if (!verse.isPublished) continue;
      const byLang: Record<string, string> = {};
      for (const t of verse.translations) {
        const code = t.languageCode;
        if (!code || !t.text?.trim()) continue;
        // Prefer first published translation per language (already ordered).
        if (!byLang[code]) byLang[code] = t.text;
      }
      const meaning = verse.meaning ?? "";
      const transliteration = verse.transliteration ?? "";
      const sanskrit = verse.sanskritText ?? "";
      const haystack = normalize(
        [
          verse.publicId,
          sanskrit,
          transliteration,
          meaning,
          byLang.en ?? "",
          byLang.hi ?? "",
          byLang.te ?? "",
          byLang.sa ?? "",
        ].join("\n"),
      );
      docs.push({
        publicId: verse.publicId,
        chapterNumber: verse.chapterNumber,
        verseNumber: verse.number,
        sanskrit,
        transliteration,
        meaning,
        byLang,
        haystack,
        topics: inferTopics(haystack),
      });
    }
  }
  return docs;
}

function getIndex(): Promise<IndexedVerse[]> {
  if (!indexPromise) {
    indexPromise = buildIndex().catch((err: unknown) => {
      indexPromise = null;
      throw err;
    });
  }
  return indexPromise;
}

function previewText(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

function scoreVerse(
  doc: IndexedVerse,
  terms: string[],
  lang: string,
): { score: number; matched: string[] } | null {
  const matched: string[] = [];
  let score = 0;
  const langText = normalize(doc.byLang[lang] ?? doc.byLang.en ?? "");

  for (const term of terms) {
    let hit = false;
    if (textMatchesTerm(doc.publicId.toLowerCase(), term)) {
      score += 20;
      hit = true;
    }
    if (textMatchesTerm(doc.haystack, term)) {
      score += 4;
      hit = true;
    }
    if (textMatchesTerm(normalize(doc.transliteration), term)) {
      score += 8;
      hit = true;
    }
    if (textMatchesTerm(langText, term)) {
      score += 10;
      hit = true;
    }
    if (textMatchesTerm(normalize(doc.meaning), term)) {
      score += 6;
      hit = true;
    }
    if (hit) matched.push(term);
  }

  if (matched.length === 0) return null;
  return { score, matched: [...new Set(matched)] };
}

export type StaticSearchParams = {
  q?: string;
  topic?: string;
  lang?: string;
  page?: number;
  pageSize?: number;
};

/**
 * Instant verse search against static snapshots (memoized for the process).
 */
export async function staticSearchVerses(
  params: StaticSearchParams,
): Promise<VerseSearchResponse> {
  const q = (params.q ?? "").trim();
  const topic = params.topic?.trim() || undefined;
  const lang = params.lang?.trim() || "en";
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));

  const normalized = normalize(q);
  const expanded = normalized ? expandQuery(normalized) : [];

  if (!normalized && !topic) {
    return {
      data: [],
      meta: {
        query: q,
        expandedTerms: [],
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const index = await getIndex();
  const scored: Array<{ doc: IndexedVerse; score: number; matched: string[] }> =
    [];

  for (const doc of index) {
    if (topic && !doc.topics.includes(topic)) continue;

    if (!normalized) {
      scored.push({ doc, score: 1, matched: [topic!] });
      continue;
    }

    const result = scoreVerse(doc, expanded, lang);
    if (!result) continue;
    scored.push({ doc, score: result.score, matched: result.matched });
  }

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      a.doc.chapterNumber - b.doc.chapterNumber ||
      a.doc.verseNumber - b.doc.verseNumber,
  );

  const total = scored.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const slice = scored.slice((page - 1) * pageSize, page * pageSize);

  const data: VerseSearchResult[] = slice.map(({ doc, score, matched }) => {
    const translation =
      doc.byLang[lang] ?? doc.byLang.en ?? doc.meaning ?? null;
    return {
      publicId: doc.publicId,
      chapterNumber: doc.chapterNumber,
      verseNumber: doc.verseNumber,
      href: `/bhagavad-gita/chapter-${doc.chapterNumber}#verse-${doc.verseNumber}`,
      sanskrit: doc.sanskrit,
      transliteration: doc.transliteration || null,
      translation,
      preview: previewText(translation ?? doc.sanskrit),
      matchedKeywords: matched.slice(0, 8),
      topics: doc.topics.slice(0, 6).map((slug) => ({
        slug,
        name: TOPIC_NAMES[slug] ?? slug,
      })),
      score,
      languageCode: lang,
    };
  });

  return {
    data,
    meta: {
      query: q,
      expandedTerms: expanded.slice(0, 24),
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

/** Warm the in-memory index (optional — first search also builds it). */
export async function warmStaticSearchIndex(): Promise<number> {
  const index = await getIndex();
  return index.length;
}

// Kick off index build as soon as this module loads (API routes / SSR).
void warmStaticSearchIndex().catch(() => undefined);
