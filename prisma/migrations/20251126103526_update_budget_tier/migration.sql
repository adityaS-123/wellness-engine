/*
  Warnings:

  - The values [GOOD] on the enum `BudgetTier` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BudgetTier_new" AS ENUM ('ESSENTIAL', 'COMPREHENSIVE', 'PREMIUM');
ALTER TABLE "supplements" ALTER COLUMN "budgetTier" TYPE "BudgetTier_new" USING ("budgetTier"::text::"BudgetTier_new");
ALTER TABLE "prescriptions" ALTER COLUMN "budgetTier" TYPE "BudgetTier_new" USING ("budgetTier"::text::"BudgetTier_new");
ALTER TYPE "BudgetTier" RENAME TO "BudgetTier_old";
ALTER TYPE "BudgetTier_new" RENAME TO "BudgetTier";
DROP TYPE "BudgetTier_old";
COMMIT;
