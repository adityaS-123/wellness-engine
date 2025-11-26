-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PRACTITIONER', 'USER');

-- CreateEnum
CREATE TYPE "BudgetTier" AS ENUM ('ESSENTIAL', 'GOOD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "EvidenceLevel" AS ENUM ('STRONG', 'MODERATE', 'EMERGING');

-- CreateEnum
CREATE TYPE "SafetyTriggerType" AS ENUM ('MEDICATION', 'CONDITION', 'PREGNANCY', 'KIDNEY_DISEASE', 'LIVER_DISEASE', 'AUTOIMMUNE', 'LOW_BLOOD_PRESSURE', 'INSOMNIA', 'ANXIETY', 'HIGH_CORTISOL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SafetySeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "SafetyAction" AS ENUM ('HARD_BLOCK', 'SOFT_WARN', 'ADJUST_DOSE', 'REMOVE');

-- CreateEnum
CREATE TYPE "InteractionSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MODERATE', 'LOW');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('DRAFT', 'GENERATED', 'REVIEWED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PRACTITIONER',
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplements" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "primaryMechanism" TEXT NOT NULL,
    "benefits" TEXT[],
    "doseRangeMin" DOUBLE PRECISION NOT NULL,
    "doseRangeMax" DOUBLE PRECISION NOT NULL,
    "doseRangeTypical" DOUBLE PRECISION NOT NULL,
    "doseUnit" TEXT NOT NULL,
    "contraindications" TEXT[],
    "medicationInteractions" TEXT[],
    "genderModifiers" JSONB NOT NULL,
    "ageModifiers" JSONB NOT NULL,
    "budgetTier" "BudgetTier" NOT NULL,
    "evidenceLevel" "EvidenceLevel" NOT NULL,
    "useCasePriority" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "supplements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocols" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "description" TEXT,
    "coreSupplementsJson" JSONB NOT NULL,
    "optionalSupplementsJson" JSONB,
    "redFlagsJson" JSONB,
    "doseModifiersJson" JSONB,
    "demographicModifiersJson" JSONB,
    "clinicalFlagsJson" JSONB,
    "budgetRulesJson" JSONB,
    "pathwayFocusJson" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "protocols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_supplements" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "supplementId" TEXT NOT NULL,
    "isCore" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "dosageModifier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "timing" TEXT,

    CONSTRAINT "protocol_supplements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_rules" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "triggerType" "SafetyTriggerType" NOT NULL,
    "triggerValue" TEXT NOT NULL,
    "affectedSupplements" TEXT[],
    "severity" "SafetySeverity" NOT NULL,
    "action" "SafetyAction" NOT NULL,
    "adjustedDose" DOUBLE PRECISION,
    "dosageUnit" TEXT,
    "warningMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interaction_rules" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "supplement1Id" TEXT,
    "supplement2Id" TEXT,
    "medication" TEXT,
    "severity" "InteractionSeverity" NOT NULL,
    "effect" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interaction_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "demographicsJson" JSONB NOT NULL,
    "clinicalFlagsJson" JSONB,
    "budgetTier" "BudgetTier" NOT NULL,
    "morningStackJson" JSONB NOT NULL,
    "afternoonStackJson" JSONB,
    "eveningStackJson" JSONB,
    "weeklyCyclicalsJson" JSONB,
    "lifestyleJson" JSONB NOT NULL,
    "redFlagsJson" JSONB,
    "warningsJson" JSONB,
    "summaryJson" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "pdfHtml" TEXT,
    "shoppingListJson" JSONB,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "supplements_externalId_key" ON "supplements"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "supplements_name_key" ON "supplements"("name");

-- CreateIndex
CREATE INDEX "supplements_category_idx" ON "supplements"("category");

-- CreateIndex
CREATE INDEX "supplements_budgetTier_idx" ON "supplements"("budgetTier");

-- CreateIndex
CREATE UNIQUE INDEX "protocols_externalId_key" ON "protocols"("externalId");

-- CreateIndex
CREATE INDEX "protocols_goal_idx" ON "protocols"("goal");

-- CreateIndex
CREATE UNIQUE INDEX "protocol_supplements_protocolId_supplementId_key" ON "protocol_supplements"("protocolId", "supplementId");

-- CreateIndex
CREATE UNIQUE INDEX "safety_rules_externalId_key" ON "safety_rules"("externalId");

-- CreateIndex
CREATE INDEX "safety_rules_triggerType_triggerValue_idx" ON "safety_rules"("triggerType", "triggerValue");

-- CreateIndex
CREATE UNIQUE INDEX "interaction_rules_externalId_key" ON "interaction_rules"("externalId");

-- CreateIndex
CREATE INDEX "prescriptions_userId_idx" ON "prescriptions"("userId");

-- CreateIndex
CREATE INDEX "prescriptions_createdAt_idx" ON "prescriptions"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_supplements" ADD CONSTRAINT "protocol_supplements_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_supplements" ADD CONSTRAINT "protocol_supplements_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "supplements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
