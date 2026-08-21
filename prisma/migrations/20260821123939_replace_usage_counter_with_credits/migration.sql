/*
  Warnings:

  - You are about to drop the `usage_counters` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "plan_config" ADD COLUMN     "pro_ai_credit_limit" INTEGER NOT NULL DEFAULT 10000;

-- DropTable
DROP TABLE "usage_counters";

-- CreateTable
CREATE TABLE "user_credits" (
    "user_id" TEXT NOT NULL,
    "monthly_allowance" INTEGER NOT NULL DEFAULT 0,
    "credits_used_this_month" INTEGER NOT NULL DEFAULT 0,
    "bonus_credits" INTEGER NOT NULL DEFAULT 0,
    "resets_at" TIMESTAMPTZ(6) NOT NULL,
    "ai_access_blocked" BOOLEAN NOT NULL DEFAULT false,
    "ai_blocked_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_credits_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "admin_action_logs" (
    "id" UUID NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_action_logs_target_user_id_idx" ON "admin_action_logs"("target_user_id");

-- CreateIndex
CREATE INDEX "admin_action_logs_admin_id_idx" ON "admin_action_logs"("admin_id");
