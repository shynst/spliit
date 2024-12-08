-- DropTable
ALTER TABLE `Activity` DROP FOREIGN KEY `Activity_groupId_fkey`;
DROP TABLE `Activity`;

-- AlterTable
ALTER TABLE `Expense`
    ADD COLUMN `createdById` VARCHAR(191) NULL AFTER `splitMode`,
    ADD COLUMN `prevVersionId` VARCHAR(191) NULL,
    ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `Expense_prevVersionId_key` ON `Expense`(`prevVersionId`);
CREATE INDEX `Expense_deleted_idx` ON `Expense`(`deleted`);
CREATE INDEX `Expense_expenseDate_idx` ON `Expense`(`expenseDate`);
CREATE INDEX `Expense_createdAt_idx` ON `Expense`(`createdAt`);

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Participant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_prevVersionId_fkey` FOREIGN KEY (`prevVersionId`) REFERENCES `Expense`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
