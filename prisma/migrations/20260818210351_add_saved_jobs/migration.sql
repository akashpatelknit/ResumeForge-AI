-- CreateEnum
CREATE TYPE "JobSource" AS ENUM ('greenhouse', 'manual');

-- CreateTable
CREATE TABLE "saved_jobs" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "source" "JobSource" NOT NULL,
    "external_job_id" TEXT,
    "company" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "location" TEXT,
    "job_description" TEXT NOT NULL,
    "requisition_id" TEXT,
    "contact_emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "is_queued" BOOLEAN NOT NULL DEFAULT false,
    "added_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_jobs_user_id_idx" ON "saved_jobs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_user_id_external_job_id_key" ON "saved_jobs"("user_id", "external_job_id");
