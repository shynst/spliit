-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "currency" VARCHAR(5) NOT NULL DEFAULT '$';
CREATE INDEX "Expense_currency_idx" ON "Expense"("currency");

-- Update
UPDATE "Expense" AS e
  SET "currency" = g."currency"
  FROM "Group" AS g
  WHERE e."groupId" = g."id";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "currency";