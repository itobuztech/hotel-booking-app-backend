-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_item_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
