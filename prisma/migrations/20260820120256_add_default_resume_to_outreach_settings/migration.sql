-- AlterTable
ALTER TABLE "user_outreach_settings" ADD COLUMN     "default_resume_id" UUID,
ADD COLUMN     "default_resume_source_type" "ResumeSourceType",
ADD COLUMN     "default_uploaded_resume_id" UUID;

-- AddForeignKey
ALTER TABLE "user_outreach_settings" ADD CONSTRAINT "user_outreach_settings_default_resume_id_fkey" FOREIGN KEY ("default_resume_id") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_outreach_settings" ADD CONSTRAINT "user_outreach_settings_default_uploaded_resume_id_fkey" FOREIGN KEY ("default_uploaded_resume_id") REFERENCES "uploaded_resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
