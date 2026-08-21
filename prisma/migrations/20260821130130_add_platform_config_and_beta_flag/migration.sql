-- AlterTable
ALTER TABLE "user_credits" ADD COLUMN     "signed_up_during_beta" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "platform_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "billing_enabled" BOOLEAN NOT NULL DEFAULT false,
    "beta_credits_per_month" INTEGER NOT NULL DEFAULT 100,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "platform_config_pkey" PRIMARY KEY ("id")
);
