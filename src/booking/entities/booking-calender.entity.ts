import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import { Room as RoomDB, Booking as BookingDB } from "@prisma/client";
import BookingStatus from "../../enums/bookingStatus.enum";

@ObjectType()
export class roomBooking {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  fullName: BookingDB["fullName"];

  @Field(() => Date)
  checkInDate: BookingDB["checkInDate"];

  @Field(() => Date)
  checkOutDate: BookingDB["checkOutDate"];

  @Field(() => BookingStatus)
  bookingStatus: BookingStatus;
}

export class bookedBranch {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;
}
@ObjectType()
export class bookedRoomType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class BookingCalender {
  @Field(() => ID)
  id: RoomDB["id"];

  @Field(() => bookedBranch)
  branch: bookedBranch;

  @Field(() => bookedRoomType)
  roomType: bookedRoomType;

  @Field(() => roomBooking)
  booking: roomBooking;

  @Field(() => Date)
  createdAt: RoomDB["createdAt"];
}
