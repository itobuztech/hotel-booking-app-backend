import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class FilterBranchRoomTypeInput {
  @Field(() => ID)
  branchId: string;

  @Field(() => ID, { nullable: true })
  roomTypeId?: string;
}
