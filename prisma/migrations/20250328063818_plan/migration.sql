/*
  Warnings:

  - You are about to drop the column `plans` on the `trip` table. All the data in the column will be lost.
  - Added the required column `planName` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planType` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tripId` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `plan` ADD COLUMN `planName` VARCHAR(191) NOT NULL,
    ADD COLUMN `planType` VARCHAR(191) NOT NULL,
    ADD COLUMN `tripId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `trip` DROP COLUMN `plans`;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`tripId`) ON DELETE CASCADE ON UPDATE CASCADE;
