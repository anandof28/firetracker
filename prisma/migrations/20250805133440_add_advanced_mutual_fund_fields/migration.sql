-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_mutual_funds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schemeCode" INTEGER NOT NULL,
    "schemeName" TEXT NOT NULL,
    "fundHouse" TEXT NOT NULL,
    "schemeType" TEXT NOT NULL,
    "schemeCategory" TEXT NOT NULL,
    "units" REAL NOT NULL,
    "avgPrice" REAL NOT NULL,
    "totalInvested" REAL NOT NULL,
    "purchaseDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentNAV" REAL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "investmentType" TEXT NOT NULL DEFAULT 'lumpsum',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "sipAmount" REAL,
    "sipDate" INTEGER,
    "sipStartDate" DATETIME,
    "sipEndDate" DATETIME,
    "sipFrequency" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "mutual_funds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_mutual_funds" ("avgPrice", "createdAt", "currentNAV", "fundHouse", "id", "isActive", "lastUpdated", "notes", "purchaseDate", "schemeCategory", "schemeCode", "schemeName", "schemeType", "totalInvested", "units", "updatedAt", "userId") SELECT "avgPrice", "createdAt", "currentNAV", "fundHouse", "id", "isActive", "lastUpdated", "notes", "purchaseDate", "schemeCategory", "schemeCode", "schemeName", "schemeType", "totalInvested", "units", "updatedAt", "userId" FROM "mutual_funds";
DROP TABLE "mutual_funds";
ALTER TABLE "new_mutual_funds" RENAME TO "mutual_funds";
CREATE INDEX "mutual_funds_userId_idx" ON "mutual_funds"("userId");
CREATE INDEX "mutual_funds_schemeCode_idx" ON "mutual_funds"("schemeCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
