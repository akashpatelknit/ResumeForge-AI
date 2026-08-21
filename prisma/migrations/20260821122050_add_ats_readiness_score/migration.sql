-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "readiness_score" INTEGER,
ADD COLUMN     "readiness_score_details" JSONB;

-- AlterTable
ALTER TABLE "uploaded_resumes" ADD COLUMN     "readiness_score" INTEGER,
ADD COLUMN     "readiness_score_details" JSONB;
