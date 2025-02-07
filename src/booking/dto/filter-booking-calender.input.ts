import { Field, ID, InputType, Int } from "@nestjs/graphql";
import BookingStatus from "../../enums/bookingStatus.enum";

@InputType()
export class FilterBookingCalenderInputs {
  @Field(() => ID, { nullable: true })
  branch?: string;

  @Field(() => ID, { nullable: true })
  roomType?: string;

  @Field(() => BookingStatus, { nullable: true })
  bookingStatus: BookingStatus;
}
