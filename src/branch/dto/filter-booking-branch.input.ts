import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class FilterBookingBranchInputs {
  @Field(() => Int, { nullable: true })
  numberOfRooms?: number;

  @Field(() => Date, { nullable: true })
  checkInDate?: Date;

  @Field(() => Date, { nullable: true })
  checkOutDate?: Date;
}
