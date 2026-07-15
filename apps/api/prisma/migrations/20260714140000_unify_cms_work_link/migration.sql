-- Unify CMS Scripture with public Work catalog; enrich verses for CMS editor.

-- AlterTable
ALTER TABLE "works" ADD COLUMN "status" VARCHAR(32) NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "verses" ADD COLUMN "meaning" TEXT,
ADD COLUMN "commentary" TEXT,
ADD COLUMN "seo_title" VARCHAR(255),
ADD COLUMN "seo_description" TEXT;

-- AlterTable
ALTER TABLE "scriptures" ADD COLUMN "work_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "scriptures_work_id_key" ON "scriptures"("work_id");

-- CreateIndex
CREATE INDEX "works_status_idx" ON "works"("status");

-- AddForeignKey
ALTER TABLE "scriptures" ADD CONSTRAINT "scriptures_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "content_revisions" (
    "id" UUID NOT NULL,
    "entity_type" VARCHAR(32) NOT NULL,
    "entity_id" UUID NOT NULL,
    "verse_id" UUID,
    "snapshot" JSONB NOT NULL,
    "note" VARCHAR(255),
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_revisions_entity_type_entity_id_created_at_idx" ON "content_revisions"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "content_revisions_verse_id_created_at_idx" ON "content_revisions"("verse_id", "created_at");

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_verse_id_fkey" FOREIGN KEY ("verse_id") REFERENCES "verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill work status from is_published
UPDATE "works" SET "status" = CASE WHEN "is_published" THEN 'published' ELSE 'draft' END;
