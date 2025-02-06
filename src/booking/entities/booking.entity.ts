import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import { Booking as BookingDB } from "@prisma/client";
import { File } from "../../upload/entities/files.entity";
import { TotalCount } from "../../types/inputtypes/toalCount.entity";
import BookingStatus from "../../enums/bookingStatus.enum";

@ObjectType()
export class roomNumbers {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  roomNumber: string;
}
@ObjectType()
export class branchBooked {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;
}
@ObjectType()
export class roomTypeBooked {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class Booking {
  @Field(() => ID)
  id: BookingDB["id"];

  @Field(() => String)
  fullName: BookingDB["fullName"];

  @Field(() => String)
  contactNumber: BookingDB["contactNumber"];

  @Field(() => File, { nullable: true })
  image?: File;

  @Field(() => [roomNumbers])
  roomNumbers: roomNumbers[];

  @Field(() => String)
  source: string;

  @Field(() => branchBooked)
  branch: branchBooked;

  @Field(() => roomTypeBooked)
  roomType: roomTypeBooked;

  @Field(() => Int)
  setPrice: number;

  @Field(() => Int)
  offerPrice: number;

  @Field(() => Date)
  checkInDate: BookingDB["checkInDate"];

  @Field(() => Date)
  checkOutDate: BookingDB["checkOutDate"];

  @Field(() => String)
  description: BookingDB["description"];

  @Field(() => BookingStatus)
  bookingStatus: BookingDB["bookingStatus"];

  @Field(() => Date)
  createdAt: BookingDB["createdAt"];
}

@ObjectType()
export class PaginatedBooking extends TotalCount {
  @Field(() => [Booking])
  bookings: Booking[];
}
