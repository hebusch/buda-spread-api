/*
  Warnings:

  - A unique constraint covering the columns `[marketName]` on the table `Alert` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Alert_marketName_key" ON "Alert"("marketName");
