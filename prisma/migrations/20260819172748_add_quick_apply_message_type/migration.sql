-- CreateEnum
CREATE TYPE "QuickApplyMessageType" AS ENUM ('cold_application', 'referral_request');

-- AlterTable
ALTER TABLE "quick_apply_entries" ADD COLUMN     "job_id" TEXT,
ADD COLUMN     "message_type" "QuickApplyMessageType" NOT NULL DEFAULT 'cold_application';
