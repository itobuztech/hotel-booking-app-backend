/*
  Warnings:

  - Added the required column `entity_id` to the `item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "item" ADD COLUMN     "entity_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
