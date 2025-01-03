/*
  Warnings:

  - The values [ITEM] on the enum `UploadTableName` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `item_id` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `room_initial` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `image_upload_id` on the `uploadRelation` table. All the data in the column will be lost.
  - You are about to drop the column `item_id` on the `uploadRelation` table. All the data in the column will be lost.
  - You are about to drop the `aminitiesRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `item` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `branch_room_type_id` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomName` to the `room` table without a default value. This is not possible if the table is not empty.
  - Made the column `branch_id` on table `room` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `upload_id` to the `uploadRelation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AmenitiesTableName" AS ENUM ('BRANCH', 'ROOM');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'CANCELLED', 'RESERVED', 'CHECKEDIN', 'CHECKDOUT', 'OVERDUE');

-- AlterEnum
BEGIN;
CREATE TYPE "UploadTableName_new" AS ENUM ('AMINITIES', 'BRANCH', 'ROOM');
ALTER TABLE "uploadRelation" ALTER COLUMN "table" TYPE "UploadTableName_new" USING ("table"::text::"UploadTableName_new");
ALTER TYPE "UploadTableName" RENAME TO "UploadTableName_old";
ALTER TYPE "UploadTableName_new" RENAME TO "UploadTableName";
DROP TYPE "UploadTableName_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "aminitiesRelation" DROP CONSTRAINT "aminitiesRelation_aminities_id_fkey";

-- DropForeignKey
ALTER TABLE "aminitiesRelation" DROP CONSTRAINT "aminitiesRelation_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "aminitiesRelation" DROP CONSTRAINT "aminitiesRelation_room_id_fkey";

-- DropForeignKey
ALTER TABLE "room" DROP CONSTRAINT "room_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "room" DROP CONSTRAINT "room_item_id_fkey";

-- DropForeignKey
ALTER TABLE "uploadRelation" DROP CONSTRAINT "uploadRelation_image_upload_id_fkey";

-- DropForeignKey
ALTER TABLE "uploadRelation" DROP CONSTRAINT "uploadRelation_item_id_fkey";

-- DropForeignKey
ALTER TABLE "uploadRelation" DROP CONSTRAINT "uploadRelation_room_id_fkey";

-- DropIndex
DROP INDEX "room_room_initial_key";

-- AlterTable
ALTER TABLE "branch" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "contact_number" SET DATA TYPE TEXT,
ALTER COLUMN "city" SET DATA TYPE TEXT,
ALTER COLUMN "area_pincode" SET DATA TYPE TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "room" DROP COLUMN "item_id",
DROP COLUMN "room_initial",
ADD COLUMN     "branch_room_type_id" UUID NOT NULL,
ADD COLUMN     "roomName" TEXT NOT NULL,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "branch_id" SET NOT NULL,
ALTER COLUMN "set_price" SET DATA TYPE TEXT,
ALTER COLUMN "offer_price" SET DATA TYPE TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "upload" ALTER COLUMN "file" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "uploadRelation" DROP COLUMN "image_upload_id",
DROP COLUMN "item_id",
ADD COLUMN     "amenities_id" UUID,
ADD COLUMN     "upload_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT true;

-- DropTable
DROP TABLE "aminitiesRelation";

-- DropTable
DROP TABLE "item";

-- DropEnum
DROP TYPE "AminitiesTableName";

-- DropEnum
DROP TYPE "Entity";

-- CreateTable
CREATE TABLE "amenities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "room_type_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roomType" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "room_initial" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roomType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "full_name" TEXT NOT NULL,
    "contact_number" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "finalPrice" DECIMAL(65,30) NOT NULL,
    "check_in_date" TIMESTAMP(3) NOT NULL,
    "check_out_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "bookingStatus" "BookingStatus" NOT NULL,
    "branch_id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookingStatusHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bookingStatus" "BookingStatus" NOT NULL,
    "booking_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookingStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branchRoomTypeRelation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_type_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,

    CONSTRAINT "branchRoomTypeRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenitiesRelation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "table" "AmenitiesTableName" NOT NULL,
    "amenities_id" UUID,
    "branch_id" UUID,
    "room_id" UUID,

    CONSTRAINT "amenitiesRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roomType_name_key" ON "roomType"("name");

-- AddForeignKey
ALTER TABLE "amenities" ADD CONSTRAINT "amenities_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "roomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_branch_room_type_id_fkey" FOREIGN KEY ("branch_room_type_id") REFERENCES "branchRoomTypeRelation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingStatusHistory" ADD CONSTRAINT "bookingStatusHistory_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingStatusHistory" ADD CONSTRAINT "bookingStatusHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_amenities_id_fkey" FOREIGN KEY ("amenities_id") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branchRoomTypeRelation" ADD CONSTRAINT "branchRoomTypeRelation_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "roomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branchRoomTypeRelation" ADD CONSTRAINT "branchRoomTypeRelation_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amenitiesRelation" ADD CONSTRAINT "amenitiesRelation_amenities_id_fkey" FOREIGN KEY ("amenities_id") REFERENCES "amenities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amenitiesRelation" ADD CONSTRAINT "amenitiesRelation_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amenitiesRelation" ADD CONSTRAINT "amenitiesRelation_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
