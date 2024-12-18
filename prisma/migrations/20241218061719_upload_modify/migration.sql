/*
  Warnings:

  - You are about to drop the column `itemId` on the `upload` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "upload" DROP CONSTRAINT "upload_itemId_fkey";

-- AlterTable
ALTER TABLE "upload" DROP COLUMN "itemId";
