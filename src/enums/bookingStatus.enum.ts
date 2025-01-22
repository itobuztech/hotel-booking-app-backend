import { registerEnumType } from "@nestjs/graphql";

enum BookingStatus {
  BOOKED = "BOOKED",
  CANCELLED = "CANCELLED",
  RESERVED = "RESERVED",
  CHECKEDIN = "CHECKEDIN",
  CHECKDOUT = "CHECKDOUT",
  OVERDUE = "OVERDUE",
}

registerEnumType(BookingStatus, {
  name: "BookingStatus",
});

export default BookingStatus;
