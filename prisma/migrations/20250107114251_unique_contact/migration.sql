/*
  Warnings:

  - A unique constraint covering the columns `[contact_number]` on the table `branch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "branch_contact_number_key" ON "branch"("contact_number");
