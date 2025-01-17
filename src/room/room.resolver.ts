import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { RoomService } from "./room.service";
import { Room } from "./entities/room.entity";
import { CreateRoomInput } from "./dto/create-room.input";
import { CreateRoomResponse } from "./dto/room-response";

@Resolver(() => Room)
export class RoomResolver {
  constructor(private readonly roomService: RoomService) { }

  @Mutation(() => CreateRoomResponse)
  createRoom(@Args("createRoomInput") createRoomInput: CreateRoomInput) {
    return this.roomService.create(createRoomInput);
  }
}
