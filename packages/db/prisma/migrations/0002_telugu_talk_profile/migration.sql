-- AlterEnum
ALTER TYPE "WorkType" ADD VALUE 'talk';

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "profile" JSONB;

-- AlterTable
ALTER TABLE "works" ADD COLUMN     "lang" TEXT NOT NULL DEFAULT 'en';

