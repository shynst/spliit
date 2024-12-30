-- AlterTable
ALTER TABLE `Expense` ADD COLUMN `currency` VARCHAR(5) NOT NULL DEFAULT '$' AFTER `amount`;
CREATE INDEX `Expense_currency_idx` ON `Expense`(`currency`);
 
-- Update
UPDATE `Expense` e
  JOIN `Group` g ON e.groupId = g.id
  SET  e.currency = g.currency;

-- AlterTable
ALTER TABLE `Group` DROP COLUMN `currency`;
