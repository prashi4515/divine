-- Phase 1.5: expanded user profile, email verification, reading prefs, audit logs

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" VARCHAR(64);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferred_translation" VARCHAR(64);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferred_commentary" VARCHAR(64);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "country" VARCHAR(2);

CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "device_label" VARCHAR(128);
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "last_used_at" TIMESTAMPTZ(3);

DROP INDEX IF EXISTS "refresh_tokens_user_id_idx";
CREATE INDEX IF NOT EXISTS "refresh_tokens_user_id_revoked_at_idx" ON "refresh_tokens"("user_id", "revoked_at");

CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");
CREATE INDEX IF NOT EXISTS "email_verification_tokens_token_hash_idx" ON "email_verification_tokens"("token_hash");

CREATE TABLE IF NOT EXISTS "reading_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "theme" VARCHAR(16) NOT NULL DEFAULT 'system',
    "language" VARCHAR(16) NOT NULL DEFAULT 'en',
    "translation_source_key" VARCHAR(64),
    "commentary_source_key" VARCHAR(64),
    "font_size" VARCHAR(32) NOT NULL DEFAULT 'comfortable',
    "font_family" VARCHAR(64) NOT NULL DEFAULT 'serif',
    "reader_width" VARCHAR(32) NOT NULL DEFAULT 'default',
    "line_height" VARCHAR(32) NOT NULL DEFAULT 'relaxed',
    "layout" VARCHAR(32) NOT NULL DEFAULT 'classic',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "reading_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "reading_preferences_user_id_key" ON "reading_preferences"("user_id");

CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(64) NOT NULL,
    "entity_type" VARCHAR(64),
    "entity_id" UUID,
    "ip" VARCHAR(64),
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

DO $$ BEGIN
  ALTER TABLE "email_verification_tokens"
    ADD CONSTRAINT "email_verification_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reading_preferences"
    ADD CONSTRAINT "reading_preferences_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
