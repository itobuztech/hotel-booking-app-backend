-- RenameForeignKey
ALTER TABLE "uploadRelation" RENAME CONSTRAINT "upload_relation_image_upload_fkey" TO "uploadRelation_image_upload_id_fkey";

-- RenameForeignKey
ALTER TABLE "uploadRelation" RENAME CONSTRAINT "upload_relation_item_table_id_fkey" TO "uploadRelation_table_id_fkey";
