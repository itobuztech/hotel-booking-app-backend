-- DropForeignKey
ALTER TABLE "bookingRoomRelation" DROP CONSTRAINT "bookingRoomRelation_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "bookingStatusHistory" DROP CONSTRAINT "bookingStatusHistory_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_booking_id_fkey";

-- AddForeignKey
ALTER TABLE "bookingStatusHistory" ADD CONSTRAINT "bookingStatusHistory_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingRoomRelation" ADD CONSTRAINT "bookingRoomRelation_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
