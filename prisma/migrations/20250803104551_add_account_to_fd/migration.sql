/*
  Warnings:

  - Added the required column `accountId` to the `FD` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FD" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "FD_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FD" ("amount", "createdAt", "endDate", "id", "rate", "startDate") SELECT "amount", "createdAt", "endDate", "id", "rate", "startDate" FROM "FD";
DROP TABLE "FD";
ALTER TABLE "new_FD" RENAME TO "FD";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
