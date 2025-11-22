/*
  Warnings:

  - A unique constraint covering the columns `[sequenceCode]` on the table `OperationType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OperationType_sequenceCode_key" ON "OperationType"("sequenceCode");
