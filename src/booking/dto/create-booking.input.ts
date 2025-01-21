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

  @Field(() => String)
  roomNumber: string;

  @Field(() => Int)
  setPrice: number;

  @Field(() => Int)
  offerPrice: number;

  @Field(() => Date)
  checkInDate: Date;

  @Field(() => Date)
  checkOutDate: Date;

  @Field(() => String)
  description: string;
}
