/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `branchAmenitiesRelation` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `branchRoomTypeAmenitiesRelation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "branchAmenitiesRelation" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "branchRoomTypeAmenitiesRelation" DROP COLUMN "deleted_at";
