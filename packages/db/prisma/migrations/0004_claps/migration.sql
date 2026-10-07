-- CreateTable
CREATE TABLE "claps" (
    "id" UUID NOT NULL,
    "work_id" UUID NOT NULL,
    "visitor_id" UUID NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "claps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "claps_work_id_ip_hash_idx" ON "claps"("work_id", "ip_hash");

-- CreateIndex
CREATE UNIQUE INDEX "claps_work_id_visitor_id_key" ON "claps"("work_id", "visitor_id");

-- AddForeignKey
ALTER TABLE "claps" ADD CONSTRAINT "claps_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase exposes every public table through its REST API with the anon key
-- that ships in the web bundle. RLS with no policies denies all of that; the
-- API's direct connection bypasses RLS, so it alone reads and writes claps.
ALTER TABLE "claps" ENABLE ROW LEVEL SECURITY;
