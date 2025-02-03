/*
  Warnings:

  - You are about to drop the column `booking_id` on the `bookingStatusHistory` table. All the data in the column will be lost.
  - Added the required column `booking_token` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `booking_token` to the `bookingStatusHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookingStatusHistory" DROP CONSTRAINT "bookingStatusHistory_booking_id_fkey";

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "booking_token" UUID NOT NULL;

-- AlterTable
ALTER TABLE "bookingStatusHistory" DROP COLUMN "booking_id",
ADD COLUMN     "booking_token" UUID NOT NULL;
