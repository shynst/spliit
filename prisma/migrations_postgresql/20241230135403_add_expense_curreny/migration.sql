-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "currency" VARCHAR(5) NOT NULL DEFAULT '$';

-- Update
UPDATE "Expense" AS e
  SET "currency" = g."currency"
  FROM "Group" AS g
  WHERE e."groupId" = g."id";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "currency";