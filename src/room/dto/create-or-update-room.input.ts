import { InputType, Field, ID, Int } from "@nestjs/graphql";
import { ActionEnum } from "../../types/enums/action-types.enum";

@InputType()
export class CreateOrUpdateRoomInput {
  @Field(() => Int)
  numberOfRooms: number;

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

@InputType()
export class ActionTypeInput {
  @Field(() => ActionEnum)
  action: string;
}
