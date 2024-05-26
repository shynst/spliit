-- DropForeignKeys
ALTER TABLE Expense DROP FOREIGN KEY Expense_paidById_fkey;
ALTER TABLE ExpensePaidFor DROP FOREIGN KEY ExpensePaidFor_participantId_fkey;


-- AlterTable Participant
ALTER TABLE Participant ADD oldId VARCHAR(191);
UPDATE Participant SET oldId = id;

ALTER TABLE Participant DROP PRIMARY KEY,
    DROP id,
    ADD id INTEGER NOT NULL AUTO_INCREMENT FIRST,
    ADD PRIMARY KEY (id);


-- AlterTable Expense
ALTER TABLE Expense
    RENAME COLUMN paidById TO oldPaidById,
    ADD paidById INTEGER NOT NULL AFTER oldPaidById;

UPDATE Expense AS e, Participant AS p
    SET e.paidById = p.id
    WHERE e.oldPaidById = p.oldId;

ALTER TABLE Expense DROP oldPaidById,
    ADD CONSTRAINT Expense_paidById_fkey FOREIGN KEY (paidById)
        REFERENCES Participant(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable ExpensePaidFor
ALTER TABLE ExpensePaidFor DROP PRIMARY KEY,
    RENAME COLUMN participantId TO oldParticipantId,
    ADD participantId INTEGER NOT NULL AFTER oldParticipantId;

UPDATE ExpensePaidFor AS e, Participant AS p
    SET e.participantId = p.id
    WHERE e.oldParticipantId = p.oldId;

ALTER TABLE ExpensePaidFor DROP oldParticipantId,
    ADD PRIMARY KEY (expenseId, participantId),
    ADD CONSTRAINT ExpensePaidFor_participantId_fkey FOREIGN KEY (participantId)
        REFERENCES Participant(id) ON DELETE CASCADE ON UPDATE CASCADE;


-- AlterTable Participant
ALTER TABLE Participant DROP oldId;
