ALTER TABLE `Expense`
    ADD COLUMN `expenseType` ENUM('EXPENSE', 'INCOME', 'REIMBURSEMENT')
    NOT NULL DEFAULT 'EXPENSE'
    AFTER `isReimbursement`;

UPDATE `Expense` SET `expenseType`='REIMBURSEMENT' WHERE `Expense`.`isReimbursement`;
UPDATE `Expense` SET `expenseType`='INCOME', `amount`=ABS(`amount`) WHERE `Expense`.`amount` < 0;

ALTER TABLE `Expense` DROP COLUMN `isReimbursement`;
