-- CreateEnum
CREATE TYPE "ResumeSourceType" AS ENUM ('builder', 'uploaded');

-- AlterTable
ALTER TABLE "quick_apply_entries" ADD COLUMN     "resume_source_type" "ResumeSourceType" NOT NULL DEFAULT 'builder',
ADD COLUMN     "uploaded_resume_id" UUID,
ALTER COLUMN "resume_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "saved_jobs" ADD COLUMN     "resume_source_type" "ResumeSourceType" NOT NULL DEFAULT 'builder',
ADD COLUMN     "uploaded_resume_id" UUID;

-- CreateTable
CREATE TABLE "uploaded_resumes" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_resumes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "uploaded_resumes_user_id_idx" ON "uploaded_resumes"("user_id");

-- AddForeignKey
ALTER TABLE "quick_apply_entries" ADD CONSTRAINT "quick_apply_entries_uploaded_resume_id_fkey" FOREIGN KEY ("uploaded_resume_id") REFERENCES "uploaded_resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_uploaded_resume_id_fkey" FOREIGN KEY ("uploaded_resume_id") REFERENCES "uploaded_resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
