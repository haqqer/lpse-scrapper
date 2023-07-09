/*
  Warnings:

  - A unique constraint covering the columns `[from]` on the table `Sources` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Sources_from_key" ON "Sources"("from");
