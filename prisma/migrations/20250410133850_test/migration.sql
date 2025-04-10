/*
  Warnings:

  - A unique constraint covering the columns `[tripId]` on the table `Productivity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Productivity_tripId_key` ON `Productivity`(`tripId`);
