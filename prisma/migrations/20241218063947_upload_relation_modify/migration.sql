/*
  Warnings:

  - You are about to drop the column `image_id` on the `uploadRelation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "uploadRelation" DROP CONSTRAINT "uploadRelation_image_id_fkey";

-- AlterTable
ALTER TABLE "uploadRelation" DROP COLUMN "image_id",
ADD COLUMN     "image_upload_id" UUID;

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_image_upload_id_fkey" FOREIGN KEY ("image_upload_id") REFERENCES "upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
