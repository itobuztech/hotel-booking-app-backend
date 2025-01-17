import { InputType, Field, ID, Int } from "@nestjs/graphql";

@InputType()
export class UpdateRoomNumberInput {
  @Field(() => ID)
  room: string;

  @Field(() => Int)
  roomNumber: number;
}
