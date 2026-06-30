-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ProductColor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "ProductColor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "productColorId" TEXT NOT NULL,
    CONSTRAINT "ProductView_productColorId_fkey" FOREIGN KEY ("productColorId") REFERENCES "ProductColor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrintZone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "decorationTypes" TEXT NOT NULL,
    "xPct" REAL NOT NULL,
    "yPct" REAL NOT NULL,
    "widthPct" REAL NOT NULL,
    "heightPct" REAL NOT NULL,
    "maxWidthCm" REAL NOT NULL,
    "maxHeightCm" REAL NOT NULL,
    "productViewId" TEXT NOT NULL,
    CONSTRAINT "PrintZone_productViewId_fkey" FOREIGN KEY ("productViewId") REFERENCES "ProductView" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mockup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderRef" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,
    "productColorId" TEXT NOT NULL,
    "productViewId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Mockup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mockup_productColorId_fkey" FOREIGN KEY ("productColorId") REFERENCES "ProductColor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mockup_productViewId_fkey" FOREIGN KEY ("productViewId") REFERENCES "ProductView" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mockup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MockupPlacement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoUrl" TEXT NOT NULL,
    "decorationType" TEXT NOT NULL,
    "xPct" REAL NOT NULL,
    "yPct" REAL NOT NULL,
    "widthPct" REAL NOT NULL,
    "heightPct" REAL NOT NULL,
    "zoneId" TEXT NOT NULL,
    "mockupId" TEXT NOT NULL,
    CONSTRAINT "MockupPlacement_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "PrintZone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MockupPlacement_mockupId_fkey" FOREIGN KEY ("mockupId") REFERENCES "Mockup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
