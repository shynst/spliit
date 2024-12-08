-- DropTable
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_groupId_fkey";
DROP TABLE "Activity";
DROP TYPE "ActivityType";

-- AlterTable
ALTER TABLE "Expense"
    ADD COLUMN "createdById" TEXT,
    ADD COLUMN "prevVersionId" TEXT,
    ADD COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_prevVersionId_key" ON "Expense"("prevVersionId");
CREATE INDEX "Expense_deleted_idx" ON "Expense"("deleted");
CREATE INDEX "Expense_expenseDate_idx" ON "Expense"("expenseDate");
CREATE INDEX "Expense_createdAt_idx" ON "Expense"("createdAt");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_prevVersionId_fkey" FOREIGN KEY ("prevVersionId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
