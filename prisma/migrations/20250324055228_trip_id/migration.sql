/*
  Warnings:

  - A unique constraint covering the columns `[tripId]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tripId` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `trip` ADD COLUMN `tripId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Trip_tripId_key` ON `Trip`(`tripId`);
