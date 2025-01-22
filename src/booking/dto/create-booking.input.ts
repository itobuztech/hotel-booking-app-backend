import { InputType, Field, ID, Int } from "@nestjs/graphql";

@InputType()
export class CreateBookingInput {
  @Field(() => String)
  fullName: string;

  // Data to be filled in the "BranchRoomTypeRelation" table
  @Field(() => String)
  contactNumber: string;

  @Field(() => ID, { nullable: true })
  image?: string;

  @Field(() => ID)
  branch: string;

  @Field(() => ID)
  roomType: string;

  @Field(() => ID)
  roomId: string;

  @Field(() => String)
  roomNumber: string;

  @Field(() => Int)
  finalPrice: number;

  @Field(() => Date)
  checkInDate: Date;

  @Field(() => Date)
  checkOutDate: Date;

  @Field(() => String)
  description: string;
}
