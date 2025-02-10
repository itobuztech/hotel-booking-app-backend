import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class FilterBookingBranchInputs {
  @Field(() => Int, { nullable: true })
  city?: number;

  @Field(() => Date, { nullable: true })
  checkInDate?: Date;

  @Field(() => Date, { nullable: true })
  checkOutDate?: Date;

  @Field(() => Int, { nullable: true })
  numberOfDays?: number;
}
