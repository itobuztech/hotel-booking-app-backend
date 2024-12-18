/*
  Warnings:

  - You are about to drop the column `png` on the `item` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TableName" AS ENUM ('ITEM');

-- DropForeignKey
ALTER TABLE "item" DROP CONSTRAINT "item_png_fkey";

-- DropIndex
DROP INDEX "item_png_key";

-- AlterTable
ALTER TABLE "item" DROP COLUMN "png";

-- AlterTable
ALTER TABLE "upload" ADD COLUMN     "itemId" UUID;

-- CreateTable
CREATE TABLE "uploadRelation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "image_id" UUID,
    "table_id" UUID,
    "table" "TableName",

    CONSTRAINT "uploadRelation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "upload" ADD CONSTRAINT "upload_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
