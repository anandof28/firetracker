-- CreateTable
CREATE TABLE "mutual_funds" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "mutual_funds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "mutual_funds_userId_idx" ON "mutual_funds"("userId");

-- CreateIndex
CREATE INDEX "mutual_funds_schemeCode_idx" ON "mutual_funds"("schemeCode");
