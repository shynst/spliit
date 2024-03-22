/*
  Warnings:

  - The primary key for the `ExpenseDocument` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ExpenseDocument` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/

-- AlterTable
ALTER TABLE `ExpenseDocument`
    DROP PRIMARY KEY,
    DROP `id`;

ALTER TABLE `ExpenseDocument`
    ADD `id` INTEGER NOT NULL AUTO_INCREMENT FIRST,
    ADD PRIMARY KEY (`id`);
