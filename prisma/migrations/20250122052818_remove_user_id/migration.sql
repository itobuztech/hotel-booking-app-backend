/*
  Warnings:

  - You are about to drop the column `userId` on the `booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_userId_fkey";

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "userId";
