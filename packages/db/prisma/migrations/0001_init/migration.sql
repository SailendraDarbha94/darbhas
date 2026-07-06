-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('poem', 'play', 'travel', 'essay', 'other');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('active', 'hidden');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ProfileRole" AS ENUM ('admin', 'writer');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "tagline" TEXT,
    "genre" "WorkType" NOT NULL DEFAULT 'other',
    "bio" TEXT,
    "theme" JSONB NOT NULL DEFAULT '{"preset": "ivory"}',
    "avatar_url" TEXT,
    "status" "TenantStatus" NOT NULL DEFAULT 'active',
    "owner_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "works" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "type" "WorkType" NOT NULL DEFAULT 'other',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "excerpt" TEXT,
    "cover_url" TEXT,
    "media" JSONB NOT NULL DEFAULT '{}',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ(6),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "requested_slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT,
    "genre" "WorkType" NOT NULL DEFAULT 'other',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "role" "ProfileRole" NOT NULL DEFAULT 'writer',
    "tenant_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_owner_user_id_key" ON "tenants"("owner_user_id");

-- CreateIndex
CREATE INDEX "works_tenant_id_published_sort_order_idx" ON "works"("tenant_id", "published", "sort_order");

-- CreateIndex
CREATE INDEX "applications_status_created_at_idx" ON "applications"("status", "created_at");

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

