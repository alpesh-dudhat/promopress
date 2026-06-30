/*
  Warnings:

  - You are about to drop the column `productViewId` on the `Mockup` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mockup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderRef" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,
    "productColorId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Mockup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mockup_productColorId_fkey" FOREIGN KEY ("productColorId") REFERENCES "ProductColor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mockup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mockup" ("createdAt", "createdById", "id", "productColorId", "productId", "salesOrderRef", "status") SELECT "createdAt", "createdById", "id", "productColorId", "productId", "salesOrderRef", "status" FROM "Mockup";
DROP TABLE "Mockup";
ALTER TABLE "new_Mockup" RENAME TO "Mockup";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
