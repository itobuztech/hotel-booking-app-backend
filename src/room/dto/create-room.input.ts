import { InputType, Int, Field } from "@nestjs/graphql";

@InputType()
export class CreateRoomInput {
  @Field(() => String)
  roomName: string;

  @Field(() => String)
  branchRoomTypeId: string;
}
