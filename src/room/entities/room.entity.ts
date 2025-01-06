import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Room as RoomDB } from "@prisma/client";

@ObjectType()
export class Room {
  @Field(() => String)
  id: RoomDB["id"];

  @Field(() => String)
  roomName: String;

  @Field(() => String)
  branchRoomTypeId: String;

  @Field(() => Boolean)
  status: boolean;

  @Field(() => Date)
  createdAt: RoomDB["createdAt"];

  @Field(() => Date, { nullable: true })
  updatedAt: RoomDB["updatedAt"] | null;
}
