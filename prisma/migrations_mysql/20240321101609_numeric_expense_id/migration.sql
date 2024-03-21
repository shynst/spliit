-- DropForeignKeys
ALTER TABLE ExpenseDocument DROP FOREIGN KEY ExpenseDocument_expenseId_fkey;
ALTER TABLE ExpensePaidFor DROP FOREIGN KEY ExpensePaidFor_expenseId_fkey;


-- AlterTable Expense
ALTER TABLE Expense DROP PRIMARY KEY,
    ADD newId INTEGER NOT NULL FIRST;

ALTER TABLE Expense
    RENAME COLUMN id TO oldId,
    RENAME COLUMN newId TO id;

UPDATE Expense AS e1,
        (SELECT 
            oldId,
            row_number() OVER (ORDER BY createdAt, expenseDate) AS sortId
        FROM Expense) AS e2
    SET e1.id = e2.sortId
    WHERE e1.oldId = e2.oldId;

ALTER TABLE Expense
    MODIFY id INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (id);


-- AlterTable ExpenseDocument
ALTER TABLE ExpenseDocument
    ADD newExpenseId INTEGER AFTER expenseId;

ALTER TABLE ExpenseDocument
    RENAME COLUMN expenseId TO oldExpenseId,
    RENAME COLUMN newExpenseId TO expenseId;

UPDATE ExpenseDocument AS e, Expense AS exp
    SET e.expenseId = exp.id
    WHERE e.oldExpenseId = exp.oldId;

ALTER TABLE ExpenseDocument DROP oldExpenseId,
    ADD CONSTRAINT ExpenseDocument_expenseId_fkey FOREIGN KEY (expenseId)
        REFERENCES Expense(id) ON DELETE SET NULL ON UPDATE CASCADE;


-- AlterTable ExpensePaidFor
ALTER TABLE ExpensePaidFor DROP PRIMARY KEY,
    ADD newExpenseId INTEGER NOT NULL FIRST;

ALTER TABLE ExpensePaidFor
    RENAME COLUMN expenseId TO oldExpenseId,
    RENAME COLUMN newExpenseId TO expenseId;

UPDATE ExpensePaidFor AS e, Expense AS exp
    SET e.expenseId = exp.id
    WHERE e.oldExpenseId = exp.oldId;

ALTER TABLE ExpensePaidFor DROP oldExpenseId,
    ADD CONSTRAINT ExpensePaidFor_expenseId_fkey FOREIGN KEY (expenseId)
        REFERENCES Expense(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE ExpensePaidFor
    ADD INDEX ExpensePaidFor_expenseId_fkey (expenseId),
    ADD PRIMARY KEY (expenseId, participantId);


-- AlterTable Expense
ALTER TABLE Expense DROP oldId;
