/*
  Warnings:

  - You are about to drop the column `booking_token` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `room_id` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `booking_token` on the `bookingStatusHistory` table. All the data in the column will be lost.
  - Added the required column `booking_id` to the `bookingStatusHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_room_id_fkey";

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "booking_token",
DROP COLUMN "room_id";

-- AlterTable
ALTER TABLE "bookingStatusHistory" DROP COLUMN "booking_token",
ADD COLUMN     "booking_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "bookingRoomRelation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookingRoomRelation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookingStatusHistory" ADD CONSTRAINT "bookingStatusHistory_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingRoomRelation" ADD CONSTRAINT "bookingRoomRelation_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingRoomRelation" ADD CONSTRAINT "bookingRoomRelation_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
