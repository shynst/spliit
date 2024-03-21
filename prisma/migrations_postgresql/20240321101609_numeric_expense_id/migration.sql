-- DropForeignKeys
ALTER TABLE "ExpenseDocument" DROP CONSTRAINT "ExpenseDocument_expenseId_fkey";
ALTER TABLE "ExpensePaidFor" DROP CONSTRAINT "ExpensePaidFor_expenseId_fkey";


-- AlterTable Expense
ALTER TABLE "Expense"
    DROP CONSTRAINT "Expense_pkey",
    ADD "oldId" TEXT;
UPDATE "Expense" SET "oldId"="id";
ALTER TABLE "Expense" ALTER COLUMN "id" TYPE INTEGER USING 0;

UPDATE "Expense"
    SET "id" = "sortId" FROM (
        SELECT 
            "oldId" AS "oldId2",
            row_number() OVER (ORDER BY "createdAt", "expenseDate") AS "sortId"
        FROM "Expense")
    WHERE "oldId" = "oldId2";

CREATE SEQUENCE "Expense_id_seq" AS integer START 1 OWNED BY "Expense"."id";

ALTER TABLE "Expense"
    ALTER COLUMN "id" SET DEFAULT nextval('"Expense_id_seq"'),
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY ("id");


-- AlterTable ExpenseDocument
ALTER TABLE "ExpenseDocument" ADD "oldExpenseId" TEXT;
UPDATE "ExpenseDocument" SET "oldExpenseId"="expenseId";
ALTER TABLE "ExpenseDocument" ALTER COLUMN "expenseId" TYPE INTEGER USING NULL;

UPDATE "ExpenseDocument"
    SET "expenseId" = "exp"."id" FROM "Expense" AS "exp"
    WHERE "oldExpenseId" = "exp"."oldId";

ALTER TABLE "ExpenseDocument"
    DROP COLUMN "oldExpenseId",
    ADD CONSTRAINT "ExpenseDocument_expenseId_fkey" FOREIGN KEY ("expenseId")
        REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- AlterTable ExpensePaidFor
ALTER TABLE "ExpensePaidFor"
    DROP CONSTRAINT "ExpensePaidFor_pkey",
    ADD "oldExpenseId" TEXT;
UPDATE "ExpensePaidFor" SET "oldExpenseId"="expenseId";
ALTER TABLE "ExpensePaidFor" ALTER COLUMN "expenseId" TYPE INTEGER USING 0;

UPDATE "ExpensePaidFor"
    SET "expenseId" = "exp"."id" FROM "Expense" AS "exp"
    WHERE "oldExpenseId" = "exp"."oldId";

ALTER TABLE "ExpensePaidFor"
    DROP COLUMN "oldExpenseId",
    ADD CONSTRAINT "ExpensePaidFor_expenseId_fkey" FOREIGN KEY ("expenseId")
        REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "ExpensePaidFor_pkey" PRIMARY KEY ("expenseId", "participantId");

-- AlterTable Expense
ALTER TABLE "Expense" DROP COLUMN "oldId";
