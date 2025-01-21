import { InputType, Field, ID, Int } from "@nestjs/graphql";

@InputType()
export class CreateBookingInput {
  @Field(() => String)
  fullName: string;

  // Data to be filled in the "BranchRoomTypeRelation" table
  @Field(() => ID)
  branchId: string;

  @Field(() => ID)
  roomTypeId: string;

  @Field(() => Int)
  setPrice: number;

  @Field(() => Int)
  offerPrice: number;

  @Field(() => String, { nullable: true })
  description?: string;

  // Data to be filled in the "BranchRoomTypeAmenitiesRelation" table
  @Field(() => [ID])
  amenities: string[];

  // Data to be filled in the "UploadRelation" table
  @Field(() => [ID])
  images: string[];
}
