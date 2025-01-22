import { InputType, Field, ID, Int } from "@nestjs/graphql";
import { CreateBookingInput } from "./create-booking.input";
import BookingStatus from "../../enums/bookingStatus.enum";

@InputType()
export class UpdateBookingInput extends CreateBookingInput {
  @Field(() => ID)
  id: string;

  @Field(() => BookingStatus)
  bookingStatus: string;
}
