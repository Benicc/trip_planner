-- CreateTable
CREATE TABLE `Assistant` (
    `assistantId` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NOT NULL,
    `messages` JSON NOT NULL,
    `backendMessages` JSON NOT NULL,
    `historyString` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Assistant_assistantId_key`(`assistantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
