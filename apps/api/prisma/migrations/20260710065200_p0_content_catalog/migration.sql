-- CreateTable
CREATE TABLE "works" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" UUID NOT NULL,
    "work_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "public_id" VARCHAR(64) NOT NULL,
    "title" VARCHAR(255),
    "verse_count" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verses" (
    "id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "public_id" VARCHAR(64) NOT NULL,
    "sanskrit_text" TEXT NOT NULL,
    "transliteration" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" UUID NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "native_name" VARCHAR(128),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_sources" (
    "id" UUID NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "author" VARCHAR(255),
    "license" VARCHAR(255),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "translation_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translations" (
    "id" UUID NOT NULL,
    "verse_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "translation_source_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verse_topics" (
    "id" UUID NOT NULL,
    "verse_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verse_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emotions" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "emotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verse_emotions" (
    "id" UUID NOT NULL,
    "verse_id" UUID NOT NULL,
    "emotion_id" UUID NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verse_emotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "works_code_key" ON "works"("code");

-- CreateIndex
CREATE UNIQUE INDEX "works_slug_key" ON "works"("slug");

-- CreateIndex
CREATE INDEX "works_is_published_sort_order_idx" ON "works"("is_published", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_public_id_key" ON "chapters"("public_id");

-- CreateIndex
CREATE INDEX "chapters_work_id_sort_order_idx" ON "chapters"("work_id", "sort_order");

-- CreateIndex
CREATE INDEX "chapters_is_published_idx" ON "chapters"("is_published");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_work_id_number_key" ON "chapters"("work_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "verses_public_id_key" ON "verses"("public_id");

-- CreateIndex
CREATE INDEX "verses_chapter_id_sort_order_idx" ON "verses"("chapter_id", "sort_order");

-- CreateIndex
CREATE INDEX "verses_is_published_idx" ON "verses"("is_published");

-- CreateIndex
CREATE UNIQUE INDEX "verses_chapter_id_number_key" ON "verses"("chapter_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE INDEX "languages_is_published_sort_order_idx" ON "languages"("is_published", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "translation_sources_key_key" ON "translation_sources"("key");

-- CreateIndex
CREATE INDEX "translation_sources_is_published_idx" ON "translation_sources"("is_published");

-- CreateIndex
CREATE INDEX "translations_language_id_translation_source_id_idx" ON "translations"("language_id", "translation_source_id");

-- CreateIndex
CREATE INDEX "translations_verse_id_is_published_idx" ON "translations"("verse_id", "is_published");

-- CreateIndex
CREATE UNIQUE INDEX "translations_verse_id_language_id_translation_source_id_key" ON "translations"("verse_id", "language_id", "translation_source_id");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE INDEX "topics_parent_id_idx" ON "topics"("parent_id");

-- CreateIndex
CREATE INDEX "topics_is_published_sort_order_idx" ON "topics"("is_published", "sort_order");

-- CreateIndex
CREATE INDEX "verse_topics_topic_id_verse_id_idx" ON "verse_topics"("topic_id", "verse_id");

-- CreateIndex
CREATE UNIQUE INDEX "verse_topics_verse_id_topic_id_key" ON "verse_topics"("verse_id", "topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "emotions_slug_key" ON "emotions"("slug");

-- CreateIndex
CREATE INDEX "emotions_is_published_sort_order_idx" ON "emotions"("is_published", "sort_order");

-- CreateIndex
CREATE INDEX "verse_emotions_emotion_id_verse_id_idx" ON "verse_emotions"("emotion_id", "verse_id");

-- CreateIndex
CREATE UNIQUE INDEX "verse_emotions_verse_id_emotion_id_key" ON "verse_emotions"("verse_id", "emotion_id");

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verses" ADD CONSTRAINT "verses_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_verse_id_fkey" FOREIGN KEY ("verse_id") REFERENCES "verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_translation_source_id_fkey" FOREIGN KEY ("translation_source_id") REFERENCES "translation_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verse_topics" ADD CONSTRAINT "verse_topics_verse_id_fkey" FOREIGN KEY ("verse_id") REFERENCES "verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verse_topics" ADD CONSTRAINT "verse_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verse_emotions" ADD CONSTRAINT "verse_emotions_verse_id_fkey" FOREIGN KEY ("verse_id") REFERENCES "verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verse_emotions" ADD CONSTRAINT "verse_emotions_emotion_id_fkey" FOREIGN KEY ("emotion_id") REFERENCES "emotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
