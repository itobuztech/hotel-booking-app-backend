import { InputType, Field, ID, Int, OmitType } from "@nestjs/graphql";
import { CreateBookingInput } from "./create-booking.input";
import BookingStatus from "../../enums/bookingStatus.enum";

@InputType()
export class UpdateBookingInput extends OmitType(CreateBookingInput, [
  "region",
] as const) {
  @Field(() => ID)
  id: string;

  @Field(() => BookingStatus)
  bookingStatus: string;

  @Field(() => String)
  source: string;
}
