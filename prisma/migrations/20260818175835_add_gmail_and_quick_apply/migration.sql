-- CreateEnum
CREATE TYPE "QuickApplyStatus" AS ENUM ('draft', 'generated', 'sent', 'failed');

-- CreateTable
CREATE TABLE "gmail_accounts" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_expires_at" TIMESTAMPTZ(6) NOT NULL,
    "connected_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "gmail_accounts_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "quick_apply_entries" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "role_title" TEXT NOT NULL,
    "pasted_context" TEXT,
    "resume_id" UUID NOT NULL,
    "generated_subject" TEXT,
    "generated_body" TEXT,
    "status" "QuickApplyStatus" NOT NULL DEFAULT 'draft',
    "gmail_message_id" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "sent_at" TIMESTAMPTZ(6),

    CONSTRAINT "quick_apply_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quick_apply_entries_user_id_idx" ON "quick_apply_entries"("user_id");

-- AddForeignKey
ALTER TABLE "quick_apply_entries" ADD CONSTRAINT "quick_apply_entries_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
