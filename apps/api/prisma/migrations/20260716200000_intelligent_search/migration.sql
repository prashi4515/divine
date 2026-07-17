-- Intelligent search: terms, keywords, history, trending + pg_trgm fuzzy

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS "search_terms" (
    "id" UUID NOT NULL,
    "term" VARCHAR(128) NOT NULL,
    "canonical" VARCHAR(128) NOT NULL,
    "kind" VARCHAR(32) NOT NULL DEFAULT 'synonym',
    "language" VARCHAR(16),
    "weight" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "search_terms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "search_terms_term_kind_key" ON "search_terms"("term", "kind");
CREATE INDEX IF NOT EXISTS "search_terms_canonical_idx" ON "search_terms"("canonical");
CREATE INDEX IF NOT EXISTS "search_terms_term_trgm_idx" ON "search_terms" USING gin ("term" gin_trgm_ops);

CREATE TABLE IF NOT EXISTS "verse_search_keywords" (
    "id" UUID NOT NULL,
    "verse_id" UUID NOT NULL,
    "keyword" VARCHAR(128) NOT NULL,
    "language" VARCHAR(16),
    "weight" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "verse_search_keywords_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "verse_search_keywords_verse_id_keyword_key" ON "verse_search_keywords"("verse_id", "keyword");
CREATE INDEX IF NOT EXISTS "verse_search_keywords_keyword_idx" ON "verse_search_keywords"("keyword");
CREATE INDEX IF NOT EXISTS "verse_search_keywords_keyword_trgm_idx" ON "verse_search_keywords" USING gin ("keyword" gin_trgm_ops);

CREATE TABLE IF NOT EXISTS "search_history" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "session_key" VARCHAR(64),
    "query" VARCHAR(255) NOT NULL,
    "result_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "search_history_user_id_created_at_idx" ON "search_history"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "search_history_session_key_created_at_idx" ON "search_history"("session_key", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "search_history_created_at_idx" ON "search_history"("created_at" DESC);

CREATE TABLE IF NOT EXISTS "search_query_stats" (
    "id" UUID NOT NULL,
    "query_normalized" VARCHAR(255) NOT NULL,
    "display_query" VARCHAR(255) NOT NULL,
    "hit_count" INTEGER NOT NULL DEFAULT 0,
    "last_searched_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "search_query_stats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "search_query_stats_query_normalized_key" ON "search_query_stats"("query_normalized");
CREATE INDEX IF NOT EXISTS "search_query_stats_hit_count_last_searched_at_idx" ON "search_query_stats"("hit_count" DESC, "last_searched_at" DESC);

DO $$ BEGIN
  ALTER TABLE "verse_search_keywords"
    ADD CONSTRAINT "verse_search_keywords_verse_id_fkey"
    FOREIGN KEY ("verse_id") REFERENCES "verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "search_history"
    ADD CONSTRAINT "search_history_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Trigram indexes on hot verse text columns for fuzzy search
CREATE INDEX IF NOT EXISTS "verses_public_id_trgm_idx" ON "verses" USING gin ("public_id" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "verses_transliteration_trgm_idx" ON "verses" USING gin ("transliteration" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "verses_meaning_trgm_idx" ON "verses" USING gin ("meaning" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "translations_text_trgm_idx" ON "translations" USING gin ("text" gin_trgm_ops);
