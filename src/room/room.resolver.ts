import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";

import { RoomService } from "./room.service";
import { Room } from "./entities/room.entity";
import { CreateRoomInput } from "./dto/create-room.input";
import { Message } from "../types/inputtypes/message.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuardOR } from "../auth/guards/permissions-or.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { PrivilegesList } from "../privileges/user-privileges";
import { UpdateRoomNumberInput } from "./dto/update-room-number.input";

@Resolver(() => Room)
export class RoomResolver {
  constructor(private readonly roomService: RoomService) {}

  // Room Creation
  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  @Roles(UserRole.ADMIN)
  @Permissions([PrivilegesList.ITEM_MANAGEMENT.CAPABILITIES.CREATE])
  roomCreate(@Args("createRoomInput") createRoomInput: CreateRoomInput) {
    return this.roomService.roomCreateService(createRoomInput);
  }

  // Room Number Update
  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  @Roles(UserRole.ADMIN)
  @Permissions([PrivilegesList.ITEM_MANAGEMENT.CAPABILITIES.EDIT])
  roomNumberUpdate(
    @Args({
      name: "updateRoomNumberInput",
      type: () => [UpdateRoomNumberInput],
    })
    updateRoomNumberInput: UpdateRoomNumberInput[]
  ) {
    return this.roomService.roomNumberUpdateService(updateRoomNumberInput);
  }
}
