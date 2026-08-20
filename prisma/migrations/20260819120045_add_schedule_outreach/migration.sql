-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OutreachStatus" ADD VALUE 'generating';
ALTER TYPE "OutreachStatus" ADD VALUE 'sending';
ALTER TYPE "OutreachStatus" ADD VALUE 'failed';

-- AlterTable
ALTER TABLE "saved_jobs" ADD COLUMN     "generated_body" TEXT,
ADD COLUMN     "generated_subject" TEXT,
ADD COLUMN     "gmail_message_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "last_error" TEXT,
ADD COLUMN     "resume_id" UUID,
ADD COLUMN     "send_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sent_at" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "user_outreach_settings" (
    "user_id" TEXT NOT NULL,
    "daily_send_limit" INTEGER NOT NULL DEFAULT 15,
    "send_window_start" TEXT NOT NULL DEFAULT '09:00',
    "send_window_end" TEXT NOT NULL DEFAULT '18:00',
    "weekdays_only" BOOLEAN NOT NULL DEFAULT true,
    "jitter_enabled" BOOLEAN NOT NULL DEFAULT true,
    "jitter_min_seconds" INTEGER NOT NULL DEFAULT 30,
    "jitter_max_seconds" INTEGER NOT NULL DEFAULT 300,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_outreach_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "saved_jobs_outreach_status_scheduled_send_time_idx" ON "saved_jobs"("outreach_status", "scheduled_send_time");

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
