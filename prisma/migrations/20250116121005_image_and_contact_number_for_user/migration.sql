/*
  Warnings:

  - A unique constraint covering the columns `[contact_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "uploadRelation" ADD COLUMN     "user_id" UUID;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "contact_number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_contact_number_key" ON "users"("contact_number");

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
