-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_status" (
    "user_id" TEXT NOT NULL,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "blocked_at" TIMESTAMPTZ(6),
    "blocked_reason" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_status_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "plan_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "pro_price_inr" INTEGER NOT NULL DEFAULT 149,
    "free_resume_limit" INTEGER NOT NULL DEFAULT 3,
    "free_ai_generation_limit" INTEGER NOT NULL DEFAULT 15,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "plan_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_meta" (
    "template_id" TEXT NOT NULL,
    "is_pro" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "template_meta_pkey" PRIMARY KEY ("template_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");
