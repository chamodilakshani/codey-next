-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- Add column for new relation
ALTER TABLE "Lesson" ADD COLUMN "levelId" TEXT;

-- Backfill levels + lesson.levelId from existing courseId
INSERT INTO "Level" ("id", "courseId", "title", "slug", "displayOrder", "createdAt", "updatedAt")
SELECT
  concat('lvl_', substr(md5(c.id), 1, 24)) AS id,
  c.id,
  'Level 1',
  'level-1',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Course" c;

UPDATE "Lesson" l
SET "levelId" = lv."id"
FROM "Level" lv
WHERE lv."courseId" = l."courseId";

ALTER TABLE "Lesson" ALTER COLUMN "levelId" SET NOT NULL;

-- Drop old constraint/indexes tied to courseId
DROP INDEX IF EXISTS "Lesson_courseId_displayOrder_idx";
DROP INDEX IF EXISTS "Lesson_courseId_slug_key";

-- Replace with level-based indexes
CREATE UNIQUE INDEX "Level_courseId_slug_key" ON "Level"("courseId", "slug");
CREATE INDEX "Level_courseId_displayOrder_idx" ON "Level"("courseId", "displayOrder");
CREATE UNIQUE INDEX "Lesson_levelId_slug_key" ON "Lesson"("levelId", "slug");
CREATE INDEX "Lesson_levelId_displayOrder_idx" ON "Lesson"("levelId", "displayOrder");

-- Replace foreign keys
ALTER TABLE "Lesson" DROP CONSTRAINT IF EXISTS "Lesson_courseId_fkey";
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Level" ADD CONSTRAINT "Level_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove old courseId column
ALTER TABLE "Lesson" DROP COLUMN "courseId";
