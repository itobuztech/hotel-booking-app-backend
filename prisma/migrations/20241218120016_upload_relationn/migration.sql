/*
  Warnings:

  - Made the column `table_id` on table `uploadRelation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `table` on table `uploadRelation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image_upload_id` on table `uploadRelation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "uploadRelation" DROP CONSTRAINT "uploadRelation_image_upload_id_fkey";

-- DropForeignKey
ALTER TABLE "uploadRelation" DROP CONSTRAINT "uploadRelation_item_table_id_fkey";

-- AlterTable
ALTER TABLE "uploadRelation" ALTER COLUMN "table_id" SET NOT NULL,
ALTER COLUMN "table" SET NOT NULL,
ALTER COLUMN "image_upload_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "upload_relation_image_upload_fkey" FOREIGN KEY ("image_upload_id") REFERENCES "upload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "upload_relation_item_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
