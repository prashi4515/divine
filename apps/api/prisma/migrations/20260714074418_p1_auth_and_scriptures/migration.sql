-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "email_verified_at" TIMESTAMPTZ(3),
    "display_name" VARCHAR(255) NOT NULL,
    "avatar_url" TEXT,
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" VARCHAR(32) NOT NULL DEFAULT 'active',
    "preferred_language" VARCHAR(16),
    "time_zone" VARCHAR(64),
    "last_login_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_identities" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "provider_subject" VARCHAR(320) NOT NULL,
    "password_hash" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "auth_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    "remember_me" BOOLEAN NOT NULL DEFAULT false,
    "user_agent" TEXT,
    "ip" VARCHAR(64),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scriptures" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "short_name" VARCHAR(64),
    "description" TEXT,
    "religion" VARCHAR(128),
    "original_language" VARCHAR(64),
    "author" VARCHAR(255),
    "estimated_date" VARCHAR(128),
    "cover_image_url" TEXT,
    "banner_image_url" TEXT,
    "theme_color" VARCHAR(32),
    "accent_color" VARCHAR(32),
    "seo_title" VARCHAR(255),
    "seo_description" TEXT,
    "seo_keywords" TEXT,
    "canonical_url" TEXT,
    "og_image_url" TEXT,
    "copyright" TEXT,
    "license" VARCHAR(255),
    "website" TEXT,
    "visibility" VARCHAR(32) NOT NULL DEFAULT 'private',
    "default_language" VARCHAR(16),
    "reading_direction" VARCHAR(8) NOT NULL DEFAULT 'ltr',
    "structure_levels" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(32) NOT NULL DEFAULT 'draft',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "book_count" INTEGER NOT NULL DEFAULT 0,
    "chapter_count" INTEGER NOT NULL DEFAULT 0,
    "verse_count" INTEGER NOT NULL DEFAULT 0,
    "translation_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "scriptures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scripture_nodes" (
    "id" UUID NOT NULL,
    "scripture_id" UUID NOT NULL,
    "parent_id" UUID,
    "label" VARCHAR(64) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "scripture_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "scripture_id" UUID,
    "kind" VARCHAR(32) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(128) NOT NULL,
    "size_bytes" INTEGER NOT NULL DEFAULT 0,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "auth_identities_user_id_idx" ON "auth_identities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_identities_provider_provider_subject_key" ON "auth_identities"("provider", "provider_subject");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "scriptures_slug_key" ON "scriptures"("slug");

-- CreateIndex
CREATE INDEX "scriptures_is_published_sort_order_idx" ON "scriptures"("is_published", "sort_order");

-- CreateIndex
CREATE INDEX "scriptures_status_idx" ON "scriptures"("status");

-- CreateIndex
CREATE INDEX "scriptures_religion_idx" ON "scriptures"("religion");

-- CreateIndex
CREATE INDEX "scripture_nodes_scripture_id_sort_order_idx" ON "scripture_nodes"("scripture_id", "sort_order");

-- CreateIndex
CREATE INDEX "scripture_nodes_parent_id_idx" ON "scripture_nodes"("parent_id");

-- CreateIndex
CREATE INDEX "media_assets_scripture_id_kind_idx" ON "media_assets"("scripture_id", "kind");

-- AddForeignKey
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scripture_nodes" ADD CONSTRAINT "scripture_nodes_scripture_id_fkey" FOREIGN KEY ("scripture_id") REFERENCES "scriptures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scripture_nodes" ADD CONSTRAINT "scripture_nodes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "scripture_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_scripture_id_fkey" FOREIGN KEY ("scripture_id") REFERENCES "scriptures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
