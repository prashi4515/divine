/**
 * SearchEngine — vendor-agnostic contract.
 * Swap PostgresSearchEngine for Meilisearch/Typesense/Elasticsearch later
 * without changing controllers or the web client.
 */

export const SEARCH_ENGINE = Symbol("SEARCH_ENGINE");

export type SearchTopicChip = {
  slug: string;
  name: string;
};

export type VerseSearchHit = {
  publicId: string;
  chapterNumber: number;
  verseNumber: number;
  href: string;
  sanskrit: string;
  transliteration: string | null;
  translation: string | null;
  preview: string;
  matchedKeywords: string[];
  topics: SearchTopicChip[];
  score: number;
  languageCode: string | null;
};

export type VerseSearchQuery = {
  q: string;
  page: number;
  pageSize: number;
  /** Topic slug filter */
  topic?: string;
  /** Prefer translation language in result cards (en|hi|te|sa) */
  language?: string;
  /** Limit to work code (default bg) */
  workCode?: string;
};

export type VerseSearchPage = {
  hits: VerseSearchHit[];
  total: number;
  expandedTerms: string[];
  query: string;
  page: number;
  pageSize: number;
};

export type SuggestQuery = {
  q: string;
  limit?: number;
  workCode?: string;
};

export type SearchSuggestionHit = {
  text: string;
  kind: "query" | "topic" | "verse" | "synonym";
  href: string | null;
};

export type RelatedContent = {
  relatedVerses: Array<{
    publicId: string;
    href: string;
    preview: string;
    topics: SearchTopicChip[];
    reason: "topic" | "people_also_read" | "keyword";
  }>;
  relatedTopics: SearchTopicChip[];
  peopleAlsoRead: Array<{
    publicId: string;
    href: string;
    preview: string;
    topics: SearchTopicChip[];
    reason: "topic" | "people_also_read" | "keyword";
  }>;
};

export interface SearchEngine {
  searchVerses(query: VerseSearchQuery): Promise<VerseSearchPage>;
  suggest(query: SuggestQuery): Promise<SearchSuggestionHit[]>;
  related(versePublicId: string): Promise<RelatedContent>;
}
