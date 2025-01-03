/*
  Warnings:

  - You are about to drop the column `room_type_id` on the `amenities` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `bookingStatusHistory` table. All the data in the column will be lost.
  - You are about to drop the column `branch_id` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `offer_price` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `set_price` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `room_id` on the `uploadRelation` table. All the data in the column will be lost.
  - You are about to drop the column `table` on the `uploadRelation` table. All the data in the column will be lost.
  - You are about to drop the `amenitiesRelation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `offer_price` to the `branchRoomTypeRelation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_initial` to the `branchRoomTypeRelation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `set_price` to the `branchRoomTypeRelation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "amenities" DROP CONSTRAINT "amenities_room_type_id_fkey";

-- DropForeignKey
ALTER TABLE "amenitiesRelation" DROP CONSTRAINT "amenitiesRelation_amenities_id_fkey";

-- DropForeignKey
ALTER TABLE "amenitiesRelation" DROP CONSTRAINT "amenitiesRelation_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "amenitiesRelation" DROP CONSTRAINT "amenitiesRelation_room_id_fkey";

-- DropForeignKey
ALTER TABLE "bookingStatusHistory" DROP CONSTRAINT "bookingStatusHistory_user_id_fkey";

-- DropForeignKey
ALTER TABLE "room" DROP CONSTRAINT "room_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "uploadRelation" DROP CONSTRAINT "uploadRelation_room_id_fkey";

-- AlterTable
ALTER TABLE "amenities" DROP COLUMN "room_type_id";

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "booked_by_id" UUID,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "bookingStatusHistory" DROP COLUMN "user_id",
ADD COLUMN     "booked_by_id" UUID,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "branchRoomTypeRelation" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "offer_price" TEXT NOT NULL,
ADD COLUMN     "room_initial" TEXT NOT NULL,
ADD COLUMN     "set_price" TEXT NOT NULL,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "room" DROP COLUMN "branch_id",
DROP COLUMN "description",
DROP COLUMN "offer_price",
DROP COLUMN "set_price";

-- AlterTable
ALTER TABLE "upload" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "uploadRelation" DROP COLUMN "room_id",
DROP COLUMN "table",
ADD COLUMN     "branch_room_type_id" UUID,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "amenitiesRelation";

-- DropEnum
DROP TYPE "AmenitiesTableName";

-- DropEnum
DROP TYPE "UploadTableName";

-- CreateTable
CREATE TABLE "branchAmenitiesRelation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "amenities_id" UUID,
    "branch_id" UUID,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branchAmenitiesRelation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_booked_by_id_fkey" FOREIGN KEY ("booked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingStatusHistory" ADD CONSTRAINT "bookingStatusHistory_booked_by_id_fkey" FOREIGN KEY ("booked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_branch_room_type_id_fkey" FOREIGN KEY ("branch_room_type_id") REFERENCES "branchRoomTypeRelation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branchAmenitiesRelation" ADD CONSTRAINT "branchAmenitiesRelation_amenities_id_fkey" FOREIGN KEY ("amenities_id") REFERENCES "amenities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branchAmenitiesRelation" ADD CONSTRAINT "branchAmenitiesRelation_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
