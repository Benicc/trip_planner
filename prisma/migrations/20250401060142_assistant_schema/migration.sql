/*
  Warnings:

  - You are about to drop the `assistant` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `trip` ADD COLUMN `backendMessages` JSON NOT NULL,
    ADD COLUMN `historyString` VARCHAR(191) NOT NULL DEFAULT '[]',
    ADD COLUMN `messages` JSON NOT NULL;

-- DropTable
DROP TABLE `assistant`;
