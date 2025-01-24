import { Field, ID, InputType, Int } from "@nestjs/graphql";
import BookingStatus from "../../enums/bookingStatus.enum";

@InputType()
export class FilterBookingInputs {
  @Field(() => ID, { nullable: true })
  branch?: string;

  @Field(() => Date, { nullable: true })
  bookingDate?: Date;

  @Field(() => ID, { nullable: true })
  roomType?: string;

  @Field(() => Date, { nullable: true })
  checkInDate: Date;

  @Field(() => Date, { nullable: true })
  checkOutDate: Date;

  @Field(() => BookingStatus, { nullable: true })
  bookingStatus: BookingStatus;
}
