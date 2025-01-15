import { Resolver, Mutation, Args, Query } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";

import { RoomService } from "./room.service";
import {
  BranchRoomType,
  RoomsOverAllOrRoomsWithInitial,
} from "./entities/room.entity";
import {
  CreateOrUpdateRoomInput,
  ActionTypeInput,
} from "./dto/create-or-update-room.input";
import { Message } from "../types/inputtypes/message.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuardOR } from "../auth/guards/permissions-or.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { PrivilegesList } from "../privileges/user-privileges";
import { UpdateRoomNumberInput } from "./dto/update-room-number.input";
import { FilterBranchRoomTypeInput } from "./dto/filter-branch-room-type.input";
import { SearchInput } from "../types/inputtypes/search-input";
import { UniqueIdentifierInput } from "src/types/inputtypes/unique-id.input";

@Resolver()
export class RoomResolver {
  constructor(private readonly roomService: RoomService) {}

  // Room Creation or Update
  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  @Roles(UserRole.ADMIN)
  @Permissions([PrivilegesList.ITEM_MANAGEMENT.CAPABILITIES.CREATE])
  roomCreateOrUpdate(
    @Args("createOrUpdateRoomInput")
    createOrUpdateRoomInput: CreateOrUpdateRoomInput,
    @Args("actionTypeInput")
    actionTypeInput: ActionTypeInput
  ) {
    return this.roomService.roomCreateOrUpdateService(
      createOrUpdateRoomInput,
      actionTypeInput
    );
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

  // Branch Roomtypes Listing
  @Query(() => RoomsOverAllOrRoomsWithInitial)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  @Roles(UserRole.ADMIN)
  @Permissions([PrivilegesList.ITEM_MANAGEMENT.CAPABILITIES.VIEW])
  branchRoomTypeListing(
    @Args("filterArgs")
    filterArgs: FilterBranchRoomTypeInput,
    @Args("search", { nullable: true })
    search?: SearchInput
  ) {
    return this.roomService.branchRoomTypeListingService(filterArgs, search);
  }

  // Branch Roomtype Detail
  @Query(() => BranchRoomType)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  @Roles(UserRole.ADMIN)
  @Permissions([PrivilegesList.ITEM_MANAGEMENT.CAPABILITIES.VIEW])
  branchRoomTypeDetails(
    @Args("branchRoomTypeId")
    branchRoomTypeId: UniqueIdentifierInput
  ) {
    return this.roomService.branchRoomTypeDetailsService(branchRoomTypeId);
  }
}
