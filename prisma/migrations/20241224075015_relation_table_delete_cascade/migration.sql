-- DropForeignKey
ALTER TABLE "uploadRelation" DROP CONSTRAINT "uploadRelation_image_upload_id_fkey";

-- DropForeignKey
ALTER TABLE "uploadRelation" DROP CONSTRAINT "uploadRelation_table_id_fkey";

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_image_upload_id_fkey" FOREIGN KEY ("image_upload_id") REFERENCES "upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
