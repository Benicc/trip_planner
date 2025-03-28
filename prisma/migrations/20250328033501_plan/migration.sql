/*
  Warnings:

  - The primary key for the `trip` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `trip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `trip` DROP PRIMARY KEY,
    DROP COLUMN `id`;

-- CreateTable
CREATE TABLE `Plan` (
    `planId` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `additional` JSON NOT NULL,

    UNIQUE INDEX `Plan_planId_key`(`planId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
