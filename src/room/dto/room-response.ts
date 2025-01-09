import { ObjectType, Int, Field } from "@nestjs/graphql";

@ObjectType()
export class CreateRoomResponse {
  @Field(() => String)
  roomName: string;

  @Field(() => String)
  branchRoomTypeId: string;

  @Field(() => Boolean)
  status: boolean;
}
