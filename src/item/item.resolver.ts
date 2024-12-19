import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UserRole } from "@prisma/client";
import { UseGuards } from "@nestjs/common";
import { ItemService } from "./item.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuardOR } from "../auth/guards/permissions-or.guard";
import { PrivilegesList } from "../privileges/user-privileges";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { CreateItemInput } from "./dto/create-item.input";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { SearchPaginationArgs } from "../types/inputtypes/search-pagination.input";
import { SortByFilters } from "../types/inputtypes/sortBy-filters.input";
import { UniqueIdentifierInput } from "../types/inputtypes/unique-id.input";
import { Item, PaginatedItem } from "./entities/item.entity";
import { Message } from "src/types/inputtypes/message.entity";
import { FilterItemInput } from "./dto/filter-item.input";
import { PaginatedEntity } from "./entities/entity.entity";

@Resolver()
export class ItemResolver {
  constructor(private readonly itemService: ItemService) {}

  // Item Creation
  @Mutation(() => Message)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN)
  // @Permissions([PrivilegesList.COURSE_MANAGEMENT.CAPABILITIES.CREATE])
  itemCreate(
    @Context() ctx,
    @Args("createItemInput") createItemInput: CreateItemInput
  ) {
    return this.itemService.createItem(ctx, createItemInput);
  }

  // Entity Listing
  @Query(() => PaginatedEntity)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.ENDUSER)
  // @Permissions([PrivilegesList.COURSE_MANAGEMENT.CAPABILITIES.VIEW])
  entityListing() {
    return this.itemService.listEntity();
  }

  // Item Listing
  @Query(() => PaginatedItem)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.ENDUSER)
  // @Permissions([PrivilegesList.COURSE_MANAGEMENT.CAPABILITIES.VIEW])
  itemListing(
    @Args("filterArgs", { nullable: true })
    filterArgs?: FilterItemInput
  ) {
    return this.itemService.listItem(filterArgs);
  }

  // Item Viewing
  @Query(() => Item)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN, UserRole.ENDUSER)
  // @Permissions([PrivilegesList.COURSE_MANAGEMENT.CAPABILITIES.VIEW])
  itemView(
    @Args("itemId")
    itemId: UniqueIdentifierInput
  ) {
    return this.itemService.viewItem(itemId);
  }

  // Item Delete
  @Mutation(() => Message)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN, UserRole.ENDUSER)
  // @Permissions([PrivilegesList.COURSE_MANAGEMENT.CAPABILITIES.VIEW])
  itemDelete(
    @Args("itemId")
    itemId: UniqueIdentifierInput
  ) {
    return this.itemService.deleteItem(itemId);
  }

  // Entity Delete
  @Mutation(() => Message)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN, UserRole.ENDUSER)
  // @Permissions([PrivilegesList.COURSE_MANAGEMENT.CAPABILITIES.VIEW])
  entityDelete(
    @Args("entityId")
    entityId: UniqueIdentifierInput
  ) {
    return this.itemService.deleteEntity(entityId);
  }
}
