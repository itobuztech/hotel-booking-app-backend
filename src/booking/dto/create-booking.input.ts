import { InputType, Field, ID, Int } from "@nestjs/graphql";
import { IsOneOfTwoFields } from "../../helpers/custom-decorators/is-one-of-two-fields";
import { IsOptional } from "class-validator";

@InputType()
export class CreateBookingInput {
  @Field(() => String)
  fullName: string;

  // Data to be filled in the "BranchRoomTypeRelation" table
  @Field(() => String)
  contactNumber: string;

  @Field(() => String, { nullable: true })
  region?: string;

  @Field(() => ID, { nullable: true })
  image?: string;

  @Field(() => ID)
  branch: string;

  @Field(() => ID)
  roomType: string;

  @Field(() => ID, { nullable: true })
  roomId?: string;

  @Field(() => [ID], { nullable: true })
  roomIdArr?: string[];

  @Field(() => Int)
  finalPrice: number;

  @Field(() => Date)
  checkInDate: Date;

  @Field(() => Date)
  checkOutDate: Date;

  @Field(() => String)
  description: string;
}
