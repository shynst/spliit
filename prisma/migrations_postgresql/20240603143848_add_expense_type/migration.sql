CREATE TYPE "ExpenseType" AS ENUM ENUM('EXPENSE', 'INCOME', 'REIMBURSEMENT');

ALTER TABLE "Expense" ADD COLUMN "expenseType" "ExpenseType" NOT NULL DEFAULT 'EXPENSE';

UPDATE "Expense" SET "expenseType"='REIMBURSEMENT' WHERE "isReimbursement";
UPDATE "Expense" SET "expenseType"='INCOME', "amount"=ABS("amount") WHERE "amount" < 0;

ALTER TABLE "Expense" DROP COLUMN "isReimbursement";
