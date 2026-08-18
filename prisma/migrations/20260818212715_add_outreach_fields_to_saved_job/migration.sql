-- CreateEnum
CREATE TYPE "OutreachType" AS ENUM ('cold', 'general', 'referral', 'quick_apply');

-- CreateEnum
CREATE TYPE "OutreachStatus" AS ENUM ('draft', 'generated', 'approved', 'scheduled', 'sent', 'replied', 'bounced');

-- AlterTable
ALTER TABLE "saved_jobs" ADD COLUMN     "last_activity_at" TIMESTAMPTZ(6),
ADD COLUMN     "outreach_status" "OutreachStatus",
ADD COLUMN     "outreach_type" "OutreachType",
ADD COLUMN     "scheduled_send_time" TIMESTAMPTZ(6);
