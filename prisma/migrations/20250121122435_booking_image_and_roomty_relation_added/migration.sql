/*
  Warnings:

  - Added the required column `branch_room_type_relation_id` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "branch_room_type_relation_id" UUID NOT NULL,
ADD COLUMN     "upload_id" UUID;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_branch_room_type_relation_id_fkey" FOREIGN KEY ("branch_room_type_relation_id") REFERENCES "branchRoomTypeRelation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
