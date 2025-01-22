import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import { Booking as BookingDB } from "@prisma/client";
import { File } from "../../upload/entities/files.entity";

@ObjectType()
export class Booking {
  @Field(() => ID)
  id: BookingDB["id"];

  @Field(() => String)
  fullName: BookingDB["fullName"];

  @Field(() => String)
  contactNumber: BookingDB["contactNumber"];

  @Field(() => [File], { nullable: true })
  image?: File[];

  @Field(() => String)
  roomNumber: string;

  @Field(() => String)
  source: string;

  @Field(() => String)
  branch: string;

  @Field(() => String)
  roomtype: string;

  @Field(() => Int)
  setPrice: number;

  @Field(() => Int)
  offerPrice: number;

  @Field(() => Date)
  checkInDate: BookingDB["checkInDate"];

  @Field(() => Date)
  checkOutDate: BookingDB["checkOutDate"];

  @Field(() => Date)
  description: BookingDB["description"];
}
