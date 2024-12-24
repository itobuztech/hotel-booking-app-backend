/*
  Warnings:

  - The `parent_room_id` column on the `item` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "item" DROP COLUMN "parent_room_id",
ADD COLUMN     "parent_room_id" UUID;
