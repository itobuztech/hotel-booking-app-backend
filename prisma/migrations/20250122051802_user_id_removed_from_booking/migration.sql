/*
  Warnings:

  - You are about to drop the column `user_id` on the `booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_user_id_fkey";

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "user_id",
ADD COLUMN     "userId" UUID;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
