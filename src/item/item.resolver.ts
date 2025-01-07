import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { ItemService } from "./item.service";
import { CreateRoomTypeInput } from "./dto/create-roomType.input";
import { UniqueIdentifierInput } from "../types/inputtypes/unique-id.input";
import { Message } from "../types/inputtypes/message.entity";
import { FilterItemInput } from "./dto/filter-item.input";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PermissionsGuardOR } from "../auth/guards/permissions-or.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { PrivilegesList } from "../privileges/user-privileges";
import { CreateAmenityInput } from "./dto/create-amenity.input";
import { PaginatedAminityOrRoomType } from "./entities/items.entity";

@Resolver()
export class ItemResolver {
  constructor(private readonly itemService: ItemService) {}

  // Amenity Creation
  @Mutation(() => Message)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN)
  // @Permissions([PrivilegesList.ITEM_MANAGEMENT.CAPABILITIES.CREATE])
  amenityCreate(
    @Args("createAmenityInput") createAmenityInput: CreateAmenityInput
  ) {
    return this.itemService.createAmenity(createAmenityInput);
  }

  // RoomType Creation
  @Mutation(() => Message)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN)
  // @Permissions([PrivilegesList.ITEM_MANAGEMENT.CAPABILITIES.CREATE])
  roomTypeCreate(
    @Args("createRoomTypeInput") createRoomTypeInput: CreateRoomTypeInput
  ) {
    return this.itemService.createRoomType(createRoomTypeInput);
  }

  // Items Listing
  @Query(() => PaginatedAminityOrRoomType)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN)
  // @Permissions([PrivilegesList.ITEM_MANAGEMENT.CAPABILITIES.VIEW])
  itemsListing(
    @Args("filterArg")
    filterArg: FilterItemInput
  ) {
    return this.itemService.listItems(filterArg);
  }

  // // Item Viewing
  // @Query(() => Item)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN)
  // @Permissions([PrivilegesList.ITEM_MANAGEMENT.CAPABILITIES.VIEW])
  // itemView(
  //   @Args("itemId")
  //   itemId: UniqueIdentifierInput
  // ) {
  //   return this.itemService.viewItem(itemId);
  // }

  // // Item Delete
  // @Mutation(() => Message)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN)
  // @Permissions([PrivilegesList.ITEM_MANAGEMENT.CAPABILITIES.DELETE])
  // itemDelete(
  //   @Args("itemId")
  //   itemId: UniqueIdentifierInput
  // ) {
  //   return this.itemService.deleteItem(itemId);
  // }

  // Item Toggle
  @Mutation(() => Message)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN)
  // @Permissions([PrivilegesList.ITEM_MANAGEMENT.CAPABILITIES.EDIT])
  itemsToggle(
    @Args("itemArg")
    itemArg: FilterItemInput,
    @Args("itemId")
    itemId: UniqueIdentifierInput
  ) {
    return this.itemService.toggleItems(itemArg, itemId);
  }
}
